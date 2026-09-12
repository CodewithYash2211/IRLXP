/**
 * IRLXP — Centralized progression engine.
 *
 * RULES:
 *  - Total XP is a LIFETIME value — it NEVER resets.
 *  - Level is derived from total XP, not stored independently.
 *  - All progression math lives here. Do not duplicate it.
 *
 * Formula:
 *  threshold(level) = floor(100 * (level - 1) ^ 1.5)
 *
 *  Level 1 starts at 0 XP (threshold = 0).
 *  Level 2 starts at 100 XP.
 *  Level 3 starts at 283 XP.
 *  Level 5 starts at 800 XP.
 *  Level 10 starts at 2,846 XP.
 *  Level 20 starts at 16,119 XP.
 */

import type { LevelInfo } from '@/types/game'

/**
 * XP threshold to REACH a given level.
 * Level 1 = 0 XP (you start at level 1).
 */
export function getLevelThreshold(level: number): number {
  if (level <= 1) return 0
  return Math.floor(100 * Math.pow(level - 1, 1.5))
}

/**
 * Derive the current level from total lifetime XP.
 * Binary search for performance at high XP values.
 */
export function getLevelFromXP(totalXP: number): number {
  if (totalXP < 0) return 1
  let level = 1
  // Reasonable upper bound — level 200 requires ~28M XP
  let low = 1, high = 200
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (getLevelThreshold(mid) <= totalXP) {
      level = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return level
}

/**
 * Full level info object derived from total lifetime XP.
 */
export function getLevelInfo(totalXP: number): LevelInfo {
  const level = getLevelFromXP(totalXP)
  const currentThreshold = getLevelThreshold(level)
  const nextThreshold = getLevelThreshold(level + 1)
  const currentLevelXP = totalXP - currentThreshold
  const nextLevelXP = nextThreshold - currentThreshold
  const progressPercent = Math.min(100, Math.floor((currentLevelXP / nextLevelXP) * 100))
  const xpToNextLevel = nextThreshold - totalXP

  return {
    level,
    totalXP,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    xpToNextLevel,
  }
}

/**
 * Returns true if adding xpGain to currentXP causes a level-up.
 */
export function willLevelUp(currentXP: number, xpGain: number): boolean {
  const levelBefore = getLevelFromXP(currentXP)
  const levelAfter = getLevelFromXP(currentXP + xpGain)
  return levelAfter > levelBefore
}

/**
 * XP progress as a percentage within the current level (0–100).
 */
export function getXPProgress(totalXP: number): number {
  return getLevelInfo(totalXP).progressPercent
}

/**
 * XP remaining until the next level.
 */
export function getXPToNextLevel(totalXP: number): number {
  return getLevelInfo(totalXP).xpToNextLevel
}
