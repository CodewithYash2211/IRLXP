/**
 * Game-layer types — UI state, API payloads, computed values.
 * Separate from raw database types.
 */

import type { QuestCategory, QuestDifficulty } from './database'

// ─── Progression ────────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number
  totalXP: number
  currentLevelXP: number      // XP accumulated within the current level
  nextLevelXP: number         // XP needed to complete the current level
  progressPercent: number     // 0–100
  xpToNextLevel: number       // remaining XP until next level threshold
}

// ─── Quest API payloads ─────────────────────────────────────────────────────

export interface CreateQuestPayload {
  title: string
  description?: string
  category: QuestCategory
  difficulty: QuestDifficulty
  due_date?: string | null
}

export interface UpdateQuestPayload {
  title?: string
  description?: string
  category?: QuestCategory
  difficulty?: QuestDifficulty
  due_date?: string | null
}

// ─── Quest completion response ───────────────────────────────────────────────

export interface QuestCompleteResult {
  xpEarned: number
  coinsEarned: number
  attributeAffected: QuestCategory
  attrGain: number
  levelBefore: number
  levelAfter: number
  leveledUp: boolean
  newStreak: number
}

// ─── Purchase response ───────────────────────────────────────────────────────

export interface PurchaseResult {
  success: boolean
  remainingCoins: number
  inventoryId: string
}

// ─── Toast / notification ────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'xp' | 'levelup'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

// ─── Reward table (for display, NOT for server trust) ───────────────────────

export interface RewardPreview {
  xp: number
  coins: number
}
