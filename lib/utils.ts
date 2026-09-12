/**
 * General-purpose utility functions.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely (handles conditional classes). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formats a number with a + prefix for positive values (e.g. +100 XP). */
export function formatGain(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

/** Formats large numbers with K suffix (e.g. 1500 → 1.5K). */
export function formatNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

/** Capitalise first letter of a string. */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Category display config. */
export const CATEGORY_CONFIG = {
  intellect:  { label: 'Intellect',  emoji: '🧠', color: 'category-intellect'  },
  strength:   { label: 'Strength',   emoji: '⚔️', color: 'category-strength'   },
  discipline: { label: 'Discipline', emoji: '🛡️', color: 'category-discipline' },
  vitality:   { label: 'Vitality',   emoji: '❤️', color: 'category-vitality'   },
} as const

/** Difficulty display config. */
export const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: 'text-green-400',  bgColor: 'bg-green-400/10'  },
  medium: { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  hard:   { label: 'Hard',   color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
  epic:   { label: 'Epic',   color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
} as const

/** Rarity display config. */
export const RARITY_CONFIG = {
  common:    { label: 'Common',    color: 'text-slate-300',  glow: '' },
  rare:      { label: 'Rare',      color: 'text-blue-400',   glow: 'shadow-blue-400/30' },
  epic:      { label: 'Epic',      color: 'text-purple-400', glow: 'shadow-purple-400/30' },
  legendary: { label: 'Legendary', color: 'text-amber-400',  glow: 'shadow-amber-400/30' },
} as const
