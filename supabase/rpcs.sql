-- =============================================================================
-- IRLXP — RPC Functions only
-- Run this when the functions are missing from the remote database.
-- Tables and policies must already exist.
-- =============================================================================

-- ─── complete_quest ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id UUID, p_timezone TEXT DEFAULT 'UTC')
RETURNS JSON AS $$
DECLARE
  v_user_id        UUID;
  v_quest          public.quests%ROWTYPE;
  v_profile        public.profiles%ROWTYPE;
  v_today          DATE;
  v_new_streak     INTEGER;
  v_attr_gain      INTEGER;
  v_level_before   INTEGER;
  v_level_after    INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_quest
  FROM public.quests
  WHERE id = p_quest_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found';
  END IF;

  IF v_quest.status <> 'active' THEN
    RAISE EXCEPTION 'Quest already completed or abandoned';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  v_level_before := GREATEST(1,
    1 + FLOOR(POWER(GREATEST(0, v_profile.total_xp)::FLOAT / 100.0, 2.0/3.0))::INTEGER
  );

  v_attr_gain := CASE v_quest.difficulty
    WHEN 'easy'   THEN 5
    WHEN 'medium' THEN 10
    WHEN 'hard'   THEN 18
    WHEN 'epic'   THEN 30
    ELSE 5
  END;

  v_today := (NOW() AT TIME ZONE COALESCE(NULLIF(p_timezone, ''), 'UTC'))::DATE;

  IF v_profile.last_activity_date IS NULL THEN
    v_new_streak := 1;
  ELSIF v_profile.last_activity_date = v_today THEN
    v_new_streak := v_profile.streak_count;
  ELSIF v_profile.last_activity_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_profile.streak_count + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  INSERT INTO public.quest_completions
    (user_id, quest_id, xp_earned, coins_earned, attribute_affected, level_before, level_after)
  VALUES
    (v_user_id, p_quest_id, v_quest.xp_reward, v_quest.coin_reward,
     v_quest.category, v_level_before, v_level_before);

  UPDATE public.quests
  SET status = 'completed', completed_at = NOW(), updated_at = NOW()
  WHERE id = p_quest_id;

  UPDATE public.profiles
  SET
    total_xp           = total_xp + v_quest.xp_reward,
    coins              = coins + v_quest.coin_reward,
    streak_count       = v_new_streak,
    last_activity_date = v_today,
    intellect  = CASE WHEN v_quest.category = 'intellect'  THEN intellect  + v_attr_gain ELSE intellect  END,
    strength   = CASE WHEN v_quest.category = 'strength'   THEN strength   + v_attr_gain ELSE strength   END,
    discipline = CASE WHEN v_quest.category = 'discipline' THEN discipline + v_attr_gain ELSE discipline END,
    vitality   = CASE WHEN v_quest.category = 'vitality'   THEN vitality   + v_attr_gain ELSE vitality   END,
    updated_at = NOW()
  WHERE id = v_user_id;

  SELECT total_xp INTO v_profile.total_xp FROM public.profiles WHERE id = v_user_id;
  v_level_after := GREATEST(1,
    1 + FLOOR(POWER(GREATEST(0, v_profile.total_xp)::FLOAT / 100.0, 2.0/3.0))::INTEGER
  );

  UPDATE public.quest_completions
  SET level_after = v_level_after
  WHERE quest_id = p_quest_id;

  RETURN json_build_object(
    'xpEarned',          v_quest.xp_reward,
    'coinsEarned',       v_quest.coin_reward,
    'attributeAffected', v_quest.category,
    'attrGain',          v_attr_gain,
    'levelBefore',       v_level_before,
    'levelAfter',        v_level_after,
    'leveledUp',         v_level_after > v_level_before,
    'newStreak',         v_new_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.complete_quest(uuid, text) TO anon, authenticated;

-- ─── purchase_item ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.purchase_item(p_item_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_item    public.items%ROWTYPE;
  v_coins   INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_item FROM public.items WHERE id = p_item_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found';
  END IF;

  SELECT coins INTO v_coins
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_coins < v_item.price THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  INSERT INTO public.inventory (user_id, item_id)
  VALUES (v_user_id, p_item_id);

  UPDATE public.profiles
  SET coins = coins - v_item.price, updated_at = NOW()
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success',        true,
    'remainingCoins', v_coins - v_item.price
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── equip_item ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.equip_item(p_item_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_item    public.items%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_item FROM public.items WHERE id = p_item_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.inventory WHERE user_id = v_user_id AND item_id = p_item_id
  ) THEN
    RAISE EXCEPTION 'Item not owned';
  END IF;

  UPDATE public.inventory inv
  SET equipped = FALSE
  FROM public.items it
  WHERE inv.item_id = it.id
    AND inv.user_id = v_user_id
    AND it.category = v_item.category;

  UPDATE public.inventory
  SET equipped = TRUE
  WHERE user_id = v_user_id AND item_id = p_item_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
