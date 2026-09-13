-- Live-database integration smoke test. All fixture data is rolled back.
BEGIN;
INSERT INTO auth.users(id, raw_user_meta_data) VALUES
('f6000000-0000-4000-8000-000000000001', '{"username":"phase6_test_a"}'),
('f6000000-0000-4000-8000-000000000002', '{"username":"phase6_test_b"}'),
('f6000000-0000-4000-8000-000000000003', '{"username":"phase6_test_c"}');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'f6000000-0000-4000-8000-000000000001', true);
SELECT public.party_action('create', '{"name":"Phase 6 rollback test"}');
SELECT set_config('phase6.code', public.get_party_state()->'party'->>'invite_code', true);
SELECT public.party_action('create_challenge', jsonb_build_object('title', 'Rollback challenge', 'target', 10, 'unit', 'pages', 'start_date', (now() AT TIME ZONE 'UTC')::date, 'end_date', (now() AT TIME ZONE 'UTC')::date));
SELECT set_config('phase6.challenge', public.get_party_state()->'challenges'->0->>'id', true);
SELECT set_config('request.jwt.claim.sub', 'f6000000-0000-4000-8000-000000000002', true);
SELECT public.party_action('join', jsonb_build_object('code', current_setting('phase6.code')));
SELECT public.party_action('participate', jsonb_build_object('challenge_id', current_setting('phase6.challenge')));
SELECT public.party_action('progress', jsonb_build_object('challenge_id', current_setting('phase6.challenge'), 'progress', 4, 'user_id', 'f6000000-0000-4000-8000-000000000001'));
DO $$ BEGIN
  IF (SELECT progress FROM public.party_challenge_progress WHERE user_id = 'f6000000-0000-4000-8000-000000000001') <> 0 THEN RAISE EXCEPTION 'Impersonation protection failed'; END IF;
  IF (SELECT progress FROM public.party_challenge_progress WHERE user_id = auth.uid()) <> 4 THEN RAISE EXCEPTION 'Persistence failed'; END IF;
  BEGIN
    UPDATE public.party_challenge_progress SET progress = 10;
    RAISE EXCEPTION 'Direct write was permitted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
SELECT public.party_action('progress', jsonb_build_object('challenge_id', current_setting('phase6.challenge'), 'progress', 10));
SELECT set_config('request.jwt.claim.sub', 'f6000000-0000-4000-8000-000000000001', true);
SELECT public.party_action('progress', jsonb_build_object('challenge_id', current_setting('phase6.challenge'), 'progress', 10));
DO $$ BEGIN
  IF public.get_party_state()->'challenges'->0->>'status' <> 'completed' THEN RAISE EXCEPTION 'Completion failed'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub', 'f6000000-0000-4000-8000-000000000003', true);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.parties) OR EXISTS (SELECT 1 FROM public.party_memberships) OR EXISTS (SELECT 1 FROM public.party_challenges) OR EXISTS (SELECT 1 FROM public.party_challenge_progress) THEN RAISE EXCEPTION 'RLS isolation failed'; END IF;
  BEGIN
    PERFORM public.party_action('participate', jsonb_build_object('challenge_id', current_setting('phase6.challenge')));
    RAISE EXCEPTION 'Unauthorized action allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
SELECT set_config('request.jwt.claim.sub', 'f6000000-0000-4000-8000-000000000002', true);
SELECT public.party_action('leave');
DO $$ BEGIN
  IF public.get_party_state()->'party' <> 'null'::jsonb THEN RAISE EXCEPTION 'Leave failed'; END IF;
END $$;
SELECT set_config('request.jwt.claim.sub', 'f6000000-0000-4000-8000-000000000001', true);
SELECT public.party_action('leave');
RESET ROLE;
SELECT 'PASS: create, join, members, challenge, progress persistence, completion, leave, RLS, impersonation; fixtures rolled back' AS result;
ROLLBACK;
