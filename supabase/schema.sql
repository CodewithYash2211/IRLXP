-- =============================================================================
-- IRLXP — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor.
-- =============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PROFILES
-- Extends auth.users. Created automatically via trigger on signup.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT        UNIQUE NOT NULL,
  display_name    TEXT,
  total_xp        INTEGER     NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  coins           INTEGER     NOT NULL DEFAULT 0 CHECK (coins >= 0),
  streak_count    INTEGER     NOT NULL DEFAULT 0 CHECK (streak_count >= 0),
  last_activity_date DATE,                       -- YYYY-MM-DD in user's timezone
  timezone        TEXT        NOT NULL DEFAULT 'UTC',
  -- Attributes (lifetime points, not reset)
  intellect       INTEGER     NOT NULL DEFAULT 0 CHECK (intellect >= 0),
  strength        INTEGER     NOT NULL DEFAULT 0 CHECK (strength >= 0),
  discipline      INTEGER     NOT NULL DEFAULT 0 CHECK (discipline >= 0),
  vitality        INTEGER     NOT NULL DEFAULT 0 CHECK (vitality >= 0),
  -- Avatar layers
  avatar_skin     TEXT        NOT NULL DEFAULT 'skin_1',
  avatar_hair     TEXT        NOT NULL DEFAULT 'hair_1',
  avatar_outfit   TEXT        NOT NULL DEFAULT 'outfit_1',
  avatar_accessory TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Auto-update updated_at ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Auto-create profile on signup ──────────────────────────────────────────
-- Username is passed via raw_user_meta_data.username at signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'hero_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'username', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- QUESTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.quests (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
  description  TEXT        CHECK (char_length(description) <= 400),
  category     TEXT        NOT NULL CHECK (category IN ('intellect','strength','discipline','vitality')),
  difficulty   TEXT        NOT NULL CHECK (difficulty IN ('easy','medium','hard','epic')),
  -- Rewards locked at creation time — not recalculated at completion
  xp_reward    INTEGER     NOT NULL CHECK (xp_reward > 0),
  coin_reward  INTEGER     NOT NULL CHECK (coin_reward > 0),
  status       TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned')),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER quests_updated_at
  BEFORE UPDATE ON public.quests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- QUEST COMPLETIONS (immutable history)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.quest_completions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id           UUID        NOT NULL REFERENCES public.quests(id) ON DELETE RESTRICT,
  xp_earned          INTEGER     NOT NULL,
  coins_earned       INTEGER     NOT NULL,
  attribute_affected TEXT        NOT NULL CHECK (attribute_affected IN ('intellect','strength','discipline','vitality')),
  level_before       INTEGER     NOT NULL,
  level_after        INTEGER     NOT NULL,
  completed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (quest_id)   -- Each quest can be completed exactly once
);

-- =============================================================================
-- ITEMS (shop catalogue — seeded, not user-writable)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL CHECK (category IN ('character','accessories','auras','badges','themes')),
  rarity      TEXT        NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','rare','epic','legendary')),
  price       INTEGER     NOT NULL CHECK (price > 0),
  asset_key   TEXT        NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INVENTORY (user-owned items)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.inventory (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id      UUID        NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  equipped     BOOLEAN     NOT NULL DEFAULT FALSE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_id)  -- No duplicate purchases
);

-- =============================================================================
-- ACHIEVEMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID        NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- =============================================================================
-- PARTY / FRIENDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.party_members (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status     TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent duplicates and self-friendship
  UNIQUE (user_id, friend_id),
  CHECK (user_id <> friend_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_quests_user_id        ON public.quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_status         ON public.quests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_quest_completions_user ON public.quest_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id     ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_party_user_id         ON public.party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_party_friend_id       ON public.party_members(friend_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members    ENABLE ROW LEVEL SECURITY;

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
-- INSERT handled by trigger (SECURITY DEFINER), no client INSERT policy needed.

-- ─── Quests ──────────────────────────────────────────────────────────────────
CREATE POLICY "Users can read own quests"
  ON public.quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quests"
  ON public.quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active quests"
  ON public.quests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'active');

CREATE POLICY "Users can delete own active quests"
  ON public.quests FOR DELETE
  USING (auth.uid() = user_id AND status = 'active');

-- ─── Quest Completions ────────────────────────────────────────────────────────
CREATE POLICY "Users can read own completions"
  ON public.quest_completions FOR SELECT
  USING (auth.uid() = user_id);
-- INSERT handled via server RPC (SECURITY DEFINER), not direct client insert.

-- ─── Items (shop catalogue) ──────────────────────────────────────────────────
CREATE POLICY "Authenticated users can read items"
  ON public.items FOR SELECT
  TO authenticated
  USING (true);
-- No INSERT/UPDATE/DELETE for clients — items are seeded by admin.

-- ─── Inventory ───────────────────────────────────────────────────────────────
CREATE POLICY "Users can read own inventory"
  ON public.inventory FOR SELECT
  USING (auth.uid() = user_id);
-- No direct INSERT/UPDATE/DELETE — handled via server RPC.

-- ─── Achievements ────────────────────────────────────────────────────────────
CREATE POLICY "Authenticated users can read achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own earned achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- ─── Party ────────────────────────────────────────────────────────────────────
-- A user can see relationships where they are either side.
CREATE POLICY "Users can see own party relationships"
  ON public.party_members FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests"
  ON public.party_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update relationships they are part of"
  ON public.party_members FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can remove own party relationships"
  ON public.party_members FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- =============================================================================
-- SERVER-SIDE RPC FUNCTIONS (SECURITY DEFINER)
-- These run with elevated privileges server-side, called from API routes
-- via supabase.rpc(). Client cannot directly manipulate XP, coins, etc.
-- =============================================================================

-- ─── complete_quest ───────────────────────────────────────────────────────────
-- Atomically:
--   1. Validates ownership + active status
--   2. Marks quest completed
--   3. Inserts quest_completion record (unique constraint prevents double-reward)
--   4. Updates profile XP, coins, attribute, streak
-- Returns the outcome as JSON.

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

  -- Lock and fetch the quest
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

  -- Fetch profile (lock)
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- Approximate level from total XP for history logging.
  -- Formula: level ≈ 1 + floor((xp/100)^(2/3))  (SQL approximation of the JS getLevelFromXP).
  -- The authoritative level is always derived in TypeScript; this value is for the record only.
  v_level_before := GREATEST(1,
    1 + FLOOR(POWER(GREATEST(0, v_profile.total_xp)::FLOAT / 100.0, 2.0/3.0))::INTEGER
  );

  -- Attribute gain based on difficulty
  v_attr_gain := CASE v_quest.difficulty
    WHEN 'easy'   THEN 5
    WHEN 'medium' THEN 10
    WHEN 'hard'   THEN 18
    WHEN 'epic'   THEN 30
    ELSE 5
  END;

  -- Streak calculation
  v_today := (NOW() AT TIME ZONE COALESCE(NULLIF(p_timezone, ''), 'UTC'))::DATE;

  IF v_profile.last_activity_date IS NULL THEN
    v_new_streak := 1;
  ELSIF v_profile.last_activity_date = v_today THEN
    v_new_streak := v_profile.streak_count;  -- already active today
  ELSIF v_profile.last_activity_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_profile.streak_count + 1;
  ELSE
    v_new_streak := 1;  -- streak broken
  END IF;

  -- Insert completion record (UNIQUE constraint on quest_id prevents double-reward)
  INSERT INTO public.quest_completions
    (user_id, quest_id, xp_earned, coins_earned, attribute_affected, level_before, level_after)
  VALUES
    (v_user_id, p_quest_id, v_quest.xp_reward, v_quest.coin_reward,
     v_quest.category, v_level_before, v_level_before);  -- level_after updated below

  -- Mark quest completed
  UPDATE public.quests
  SET status = 'completed', completed_at = NOW(), updated_at = NOW()
  WHERE id = p_quest_id;

  -- Update profile
  UPDATE public.profiles
  SET
    total_xp  = total_xp + v_quest.xp_reward,
    coins     = coins + v_quest.coin_reward,
    streak_count      = v_new_streak,
    last_activity_date = v_today,
    intellect  = CASE WHEN v_quest.category = 'intellect'  THEN intellect  + v_attr_gain ELSE intellect  END,
    strength   = CASE WHEN v_quest.category = 'strength'   THEN strength   + v_attr_gain ELSE strength   END,
    discipline = CASE WHEN v_quest.category = 'discipline' THEN discipline + v_attr_gain ELSE discipline END,
    vitality   = CASE WHEN v_quest.category = 'vitality'   THEN vitality   + v_attr_gain ELSE vitality   END,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Re-fetch updated XP for level_after
  SELECT total_xp INTO v_profile.total_xp FROM public.profiles WHERE id = v_user_id;
  v_level_after := GREATEST(1,
    1 + FLOOR(POWER(GREATEST(0, v_profile.total_xp)::FLOAT / 100.0, 2.0/3.0))::INTEGER
  );

  -- Update completion record with actual level_after
  UPDATE public.quest_completions
  SET level_after = v_level_after
  WHERE quest_id = p_quest_id;

  RETURN json_build_object(
    'xpEarned',           v_quest.xp_reward,
    'coinsEarned',        v_quest.coin_reward,
    'attributeAffected',  v_quest.category,
    'attrGain',           v_attr_gain,
    'levelBefore',        v_level_before,
    'levelAfter',         v_level_after,
    'leveledUp',          v_level_after > v_level_before,
    'newStreak',          v_new_streak
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

  -- Fetch item
  SELECT * INTO v_item FROM public.items WHERE id = p_item_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found';
  END IF;

  -- Fetch and lock profile
  SELECT coins INTO v_coins
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_coins < v_item.price THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  -- Insert inventory (UNIQUE constraint prevents duplicate purchase)
  INSERT INTO public.inventory (user_id, item_id)
  VALUES (v_user_id, p_item_id);

  -- Deduct coins
  UPDATE public.profiles
  SET coins = coins - v_item.price, updated_at = NOW()
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success',          true,
    'remainingCoins',   v_coins - v_item.price
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── equip_item ────────────────────────────────────────────────────────────────
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

  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.inventory WHERE user_id = v_user_id AND item_id = p_item_id
  ) THEN
    RAISE EXCEPTION 'Item not owned';
  END IF;

  -- Unequip others in same category
  UPDATE public.inventory inv
  SET equipped = FALSE
  FROM public.items it
  WHERE inv.item_id = it.id
    AND inv.user_id = v_user_id
    AND it.category = v_item.category;

  -- Equip this item
  UPDATE public.inventory
  SET equipped = TRUE
  WHERE user_id = v_user_id AND item_id = p_item_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
