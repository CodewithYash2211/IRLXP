-- =============================================================================
-- IRLXP — Shop Items Seed Data
-- Run AFTER schema.sql in your Supabase SQL Editor.
-- =============================================================================

INSERT INTO public.items (name, description, category, rarity, price, asset_key) VALUES

-- ─── Accessories ─────────────────────────────────────────────────────────────
('Pixel Cap',        'A classic 8-bit cap for the urban adventurer.',    'accessories', 'common',    80,  'acc_pixel_cap'),
('Neon Shades',      'Shades so bright they glow in the dark.',          'accessories', 'rare',      200, 'acc_neon_shades'),
('Explorer Backpack','Worn by legendary adventurers across all realms.',  'accessories', 'rare',      250, 'acc_explorer_pack'),
('Speed Shoes',      'Lightweight runners — for when destiny calls.',    'accessories', 'common',    120, 'acc_speed_shoes'),
('Champion Crown',   'Only the most consistent heroes wear this.',       'accessories', 'legendary', 800, 'acc_champion_crown'),

-- ─── Auras ────────────────────────────────────────────────────────────────────
('Flame Aura',       'A flickering aura for the relentlessly driven.',   'auras', 'rare',      300, 'aura_flame'),
('Frost Aura',       'Ice-cold composure radiates from within.',         'auras', 'rare',      300, 'aura_frost'),
('Storm Aura',       'Electricity crackles with every step.',            'auras', 'epic',      600, 'aura_storm'),
('Void Aura',        'The rarest aura — from beyond the edge of the map.','auras','legendary', 1200,'aura_void'),
('Verdant Aura',     'Nature''s blessing for those who endure.',         'auras', 'common',    150, 'aura_verdant'),

-- ─── Badges ───────────────────────────────────────────────────────────────────
('Iron Resolve',     'Proof you completed 10 quests.',                   'badges', 'common',    50,  'badge_iron_resolve'),
('Streak Master',    'A 7-day streak badge for the disciplined.',        'badges', 'rare',      200, 'badge_streak_master'),
('Intellect Scholar','Awarded for 1000 Intellect XP earned.',            'badges', 'epic',      500, 'badge_intellect'),
('Warrior''s Mark',  'For those who conquered the Strength path.',       'badges', 'epic',      500, 'badge_warrior'),

-- ─── Themes ───────────────────────────────────────────────────────────────────
('Dark Realm',       'A dark theme for adventurers who prefer the night.','themes','rare',      350, 'theme_dark_realm'),
('Golden Kingdom',   'A gilded theme for those who''ve earned it.',      'themes', 'legendary', 900, 'theme_golden_kingdom')

ON CONFLICT (asset_key) DO NOTHING;

-- ─── Achievements ─────────────────────────────────────────────────────────────
INSERT INTO public.achievements (key, name, description, icon) VALUES
('first_quest',      'First Quest',        'Complete your first quest.',             '⚔️'),
('streak_3',         'On a Roll',          'Maintain a 3-day streak.',               '🔥'),
('streak_7',         'Week Warrior',       'Maintain a 7-day streak.',               '🔥'),
('streak_30',        'Legendary Resolve',  'Maintain a 30-day streak.',              '👑'),
('level_5',          'Rising Hero',        'Reach Level 5.',                         '⭐'),
('level_10',         'Seasoned Adventurer','Reach Level 10.',                        '🌟'),
('level_20',         'Legendary Status',   'Reach Level 20.',                        '✨'),
('quests_10',        'Questmaster',        'Complete 10 quests.',                    '📜'),
('quests_50',        'Epic Questmaster',   'Complete 50 quests.',                    '📜'),
('intellect_100',    'Scholar',            'Earn 100 Intellect points.',             '🧠'),
('strength_100',     'Warrior',            'Earn 100 Strength points.',              '⚔️'),
('discipline_100',   'Disciplinarian',     'Earn 100 Discipline points.',            '🛡️'),
('vitality_100',     'Life Force',         'Earn 100 Vitality points.',              '❤️'),
('first_purchase',   'Spender',            'Purchase your first item from the Loot shop.','🪙')
ON CONFLICT (key) DO NOTHING;
