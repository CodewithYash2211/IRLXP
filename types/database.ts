/**
 * Supabase database types — kept in sync with supabase/schema.sql
 * Source of truth for all table row shapes.
 */

export type QuestCategory = 'intellect' | 'strength' | 'discipline' | 'vitality'
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic'
export type QuestStatus = 'active' | 'completed' | 'abandoned'
export type ItemCategory = 'character' | 'accessories' | 'auras' | 'badges' | 'themes'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type PartyStatus = 'pending' | 'accepted'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  total_xp: number
  coins: number
  streak_count: number
  last_activity_date: string | null  // ISO date string YYYY-MM-DD
  timezone: string                    // IANA tz, e.g. 'Asia/Kolkata'
  intellect: number
  strength: number
  discipline: number
  vitality: number
  // Avatar layers
  avatar_skin: string
  avatar_hair: string
  avatar_outfit: string
  avatar_accessory: string | null
  created_at: string
  updated_at: string
}

export interface Quest {
  id: string
  user_id: string
  title: string
  description: string | null
  category: QuestCategory
  difficulty: QuestDifficulty
  xp_reward: number
  coin_reward: number
  status: QuestStatus
  due_date: string | null   // ISO date string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface QuestCompletion {
  id: string
  user_id: string
  quest_id: string
  xp_earned: number
  coins_earned: number
  attribute_affected: QuestCategory
  level_before: number
  level_after: number
  completed_at: string
}

export interface Item {
  id: string
  name: string
  description: string | null
  category: ItemCategory
  rarity: ItemRarity
  price: number
  asset_key: string   // identifier used to render the correct visual
  created_at: string
}

export interface InventoryItem {
  id: string
  user_id: string
  item_id: string
  equipped: boolean
  purchased_at: string
  // Joined item data (when fetched with JOIN)
  item?: Item
}

export interface Achievement {
  id: string
  key: string
  name: string
  description: string | null
  icon: string | null
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface PartyMember {
  id: string
  user_id: string
  friend_id: string
  status: PartyStatus
  created_at: string
  // Joined profile data
  friend_profile?: Pick<Profile, 'id' | 'username' | 'display_name' | 'total_xp' | 'avatar_skin'>
}
