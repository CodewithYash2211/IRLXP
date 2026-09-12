/**
 * IRLXP — Server-authoritative reward definitions.
 *
 * These values are used SERVER-SIDE only to determine the actual reward
 * when a quest is completed. The client MUST NOT be trusted to supply
 * reward amounts — it only sends the quest ID.
 *
 * Rewards are stored on the quest row at creation time (locked in),
 * so editing difficulty after creation does not retroactively change rewards.
 */

import type { QuestDifficulty } from '@/types/database'
import type { RewardPreview } from '@/types/game'

export const DIFFICULTY_REWARDS: Record<QuestDifficulty, RewardPreview> = {
  easy:   { xp: 50,  coins: 10 },
  medium: { xp: 100, coins: 20 },
  hard:   { xp: 175, coins: 35 },
  epic:   { xp: 300, coins: 60 },
}

/**
 * Attribute XP gained per quest completion (per-attribute leveling).
 * Smaller values than main XP since attributes level independently.
 */
export const ATTRIBUTE_XP: Record<QuestDifficulty, number> = {
  easy:   5,
  medium: 10,
  hard:   18,
  epic:   30,
}

/**
 * Returns reward preview for a given difficulty.
 * Used on the client to SHOW expected rewards — actual reward is server-determined.
 */
export function getRewardPreview(difficulty: QuestDifficulty): RewardPreview {
  return DIFFICULTY_REWARDS[difficulty]
}

/**
 * Returns the attribute XP gain for a difficulty level.
 */
export function getAttributeGain(difficulty: QuestDifficulty): number {
  return ATTRIBUTE_XP[difficulty]
}
