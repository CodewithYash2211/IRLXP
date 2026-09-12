-- Phase 6 additive upgrade. Apply once AFTER schema.sql; do not rerun schema.sql.
-- No changes to the legacy friend-request table, profiles, quests, or shop.
BEGIN;
CREATE SCHEMA IF NOT EXISTS irlxp_private;
REVOKE ALL ON SCHEMA irlxp_private FROM PUBLIC;
GRANT USAGE ON SCHEMA irlxp_private TO authenticated;

CREATE TABLE public.parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 40),
  invite_code text NOT NULL UNIQUE DEFAULT ('IRLXP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.party_memberships (
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (party_id, user_id)
);
CREATE TABLE public.party_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 400),
  target integer NOT NULL CHECK (target BETWEEN 1 AND 1000000),
  unit text NOT NULL CHECK (char_length(btrim(unit)) BETWEEN 1 AND 30),
  start_date date NOT NULL,
  end_date date NOT NULL CHECK (end_date >= start_date AND end_date <= start_date + 365),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (party_id, id)
);
CREATE TABLE public.party_challenge_progress (
  challenge_id uuid NOT NULL REFERENCES public.party_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0),
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (challenge_id, user_id)
);
CREATE INDEX party_challenges_party_date ON public.party_challenges(party_id, created_at DESC);
CREATE INDEX party_challenges_creator ON public.party_challenges(created_by);
CREATE INDEX party_progress_user ON public.party_challenge_progress(user_id);
CREATE INDEX parties_creator ON public.parties(created_by);

-- Narrow, non-recursive membership check for SELECT policies.
CREATE FUNCTION irlxp_private.in_party(p_party uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.party_memberships WHERE party_id = p_party AND user_id = (SELECT auth.uid())
  );
$$;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_challenge_progress ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.parties, public.party_memberships, public.party_challenges, public.party_challenge_progress FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.parties, public.party_memberships, public.party_challenges, public.party_challenge_progress TO authenticated;
CREATE POLICY party_read ON public.parties FOR SELECT TO authenticated USING (irlxp_private.in_party(id));
CREATE POLICY membership_read ON public.party_memberships FOR SELECT TO authenticated USING (irlxp_private.in_party(party_id));
CREATE POLICY challenge_read ON public.party_challenges FOR SELECT TO authenticated USING (irlxp_private.in_party(party_id));
CREATE POLICY progress_read ON public.party_challenge_progress FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.party_challenges c WHERE c.id = challenge_id AND irlxp_private.in_party(c.party_id))
);

-- Member profile projection intentionally excludes private profile fields.
CREATE FUNCTION irlxp_private.party_state() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_party uuid; v_today date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to access your party.' USING ERRCODE = '42501'; END IF;
  SELECT party_id INTO v_party FROM public.party_memberships WHERE user_id = auth.uid();
  IF v_party IS NULL THEN RETURN jsonb_build_object('party', NULL, 'members', '[]'::jsonb, 'challenges', '[]'::jsonb, 'today', v_today); END IF;
  RETURN jsonb_build_object(
    'today', v_today,
    'party', (SELECT to_jsonb(p) FROM public.parties p WHERE p.id = v_party),
    'members', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'id', p.id, 'username', p.username, 'display_name', p.display_name, 'total_xp', p.total_xp,
      'completed_challenges', (SELECT count(*) FROM public.party_challenge_progress pr JOIN public.party_challenges c ON c.id = pr.challenge_id
        WHERE c.party_id = v_party AND pr.user_id = p.id AND pr.progress >= c.target)
    ) ORDER BY p.total_xp DESC, p.username) FROM public.party_memberships m JOIN public.profiles p ON p.id = m.user_id WHERE m.party_id = v_party), '[]'::jsonb),
    'challenges', COALESCE((SELECT jsonb_agg(to_jsonb(c) || jsonb_build_object(
      'status', CASE WHEN c.status = 'completed' THEN 'completed' WHEN c.end_date < v_today THEN 'expired' WHEN c.start_date > v_today THEN 'upcoming' ELSE 'active' END,
      'participants', COALESCE((SELECT jsonb_agg(to_jsonb(pr) ORDER BY pr.joined_at, pr.user_id) FROM public.party_challenge_progress pr WHERE pr.challenge_id = c.id), '[]'::jsonb)
    ) ORDER BY c.created_at DESC, c.id) FROM public.party_challenges c WHERE c.party_id = v_party), '[]'::jsonb)
  );
END;
$$;

-- All writes go through this authenticated transaction. No client user ID is accepted.
-- Per-user and per-party locks serialize membership, capacity, and completion decisions.
CREATE FUNCTION irlxp_private.party_action(p_action text, p_payload jsonb DEFAULT '{}'::jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user uuid := auth.uid(); v_party uuid; v_challenge public.party_challenges%ROWTYPE;
  v_id uuid; v_value integer; v_today date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in to access your party.' USING ERRCODE = '42501'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_user::text, 6));
  SELECT party_id INTO v_party FROM public.party_memberships WHERE user_id = v_user;
  IF p_action IN ('create', 'join') THEN
    IF v_party IS NOT NULL THEN RAISE EXCEPTION 'You already belong to a party. Leave it before joining another.' USING ERRCODE = '22023'; END IF;
    IF p_action = 'create' THEN
      INSERT INTO public.parties(name, created_by) VALUES (btrim(p_payload->>'name'), v_user) RETURNING id INTO v_party;
    ELSE
      SELECT id INTO v_party FROM public.parties WHERE invite_code = upper(btrim(p_payload->>'code')) FOR UPDATE;
      IF v_party IS NULL THEN RAISE EXCEPTION 'Invalid party code.' USING ERRCODE = '22023'; END IF;
      IF (SELECT count(*) FROM public.party_memberships WHERE party_id = v_party) >= 8 THEN
        RAISE EXCEPTION 'This party is full (8 members).' USING ERRCODE = '22023';
      END IF;
    END IF;
    INSERT INTO public.party_memberships(party_id, user_id) VALUES (v_party, v_user);
    RETURN;
  END IF;
  IF v_party IS NULL THEN RAISE EXCEPTION 'Join a party first.' USING ERRCODE = '42501'; END IF;
  PERFORM 1 FROM public.parties WHERE id = v_party FOR UPDATE;
  IF p_action = 'leave' THEN
    DELETE FROM public.party_memberships WHERE user_id = v_user;
    -- Keep existing challenge history while the party has members.
    IF NOT EXISTS (SELECT 1 FROM public.party_memberships WHERE party_id = v_party) THEN
      DELETE FROM public.parties WHERE id = v_party;
    END IF;
    RETURN;
  ELSIF p_action = 'create_challenge' THEN
    IF (p_payload->>'end_date')::date < v_today THEN RAISE EXCEPTION 'End date must be today or later (UTC).' USING ERRCODE = '22023'; END IF;
    INSERT INTO public.party_challenges(party_id, title, description, target, unit, start_date, end_date, created_by)
    VALUES (v_party, btrim(p_payload->>'title'), COALESCE(p_payload->>'description', ''), (p_payload->>'target')::integer,
      btrim(p_payload->>'unit'), (p_payload->>'start_date')::date, (p_payload->>'end_date')::date, v_user) RETURNING id INTO v_id;
    INSERT INTO public.party_challenge_progress(challenge_id, user_id) VALUES (v_id, v_user);
    RETURN;
  END IF;
  SELECT * INTO v_challenge FROM public.party_challenges WHERE id = (p_payload->>'challenge_id')::uuid AND party_id = v_party FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Challenge not found in your party.' USING ERRCODE = '42501'; END IF;
  IF v_challenge.status <> 'active' OR v_challenge.end_date < v_today THEN
    RAISE EXCEPTION 'This challenge has ended.' USING ERRCODE = '22023';
  END IF;
  IF p_action = 'participate' THEN
    INSERT INTO public.party_challenge_progress(challenge_id, user_id) VALUES (v_challenge.id, v_user) ON CONFLICT DO NOTHING;
  ELSIF p_action = 'progress' THEN
    IF v_challenge.start_date > v_today THEN RAISE EXCEPTION 'This challenge has not started yet.' USING ERRCODE = '22023'; END IF;
    v_value := (p_payload->>'progress')::integer;
    IF v_value IS NULL OR v_value < 0 OR v_value > v_challenge.target THEN RAISE EXCEPTION 'Progress must be between zero and the target.' USING ERRCODE = '22023'; END IF;
    UPDATE public.party_challenge_progress SET progress = v_value, updated_at = now() WHERE challenge_id = v_challenge.id AND user_id = v_user;
    IF NOT FOUND THEN RAISE EXCEPTION 'Participate before updating progress.' USING ERRCODE = '22023'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.party_challenge_progress WHERE challenge_id = v_challenge.id AND progress < v_challenge.target) THEN
      UPDATE public.party_challenges SET status = 'completed', completed_at = now() WHERE id = v_challenge.id;
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown party action.' USING ERRCODE = '22023';
  END IF;
END;
$$;

-- Exposed entry points remain invoker functions; privileged code stays private.
CREATE FUNCTION public.get_party_state() RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$ SELECT irlxp_private.party_state(); $$;
CREATE FUNCTION public.party_action(p_action text, p_payload jsonb DEFAULT '{}'::jsonb) RETURNS void
LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$ SELECT irlxp_private.party_action(p_action, p_payload); $$;
REVOKE ALL ON FUNCTION irlxp_private.in_party(uuid), irlxp_private.party_state(), irlxp_private.party_action(text, jsonb), public.get_party_state(), public.party_action(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION irlxp_private.in_party(uuid), irlxp_private.party_state(), irlxp_private.party_action(text, jsonb), public.get_party_state(), public.party_action(text, jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
