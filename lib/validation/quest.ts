/**
 * Quest input validation — shared between client-side form validation
 * and server-side API route validation.
 */

import type { QuestCategory, QuestDifficulty } from '@/types/database'

export const VALID_CATEGORIES: QuestCategory[] = ['intellect', 'strength', 'discipline', 'vitality']
export const VALID_DIFFICULTIES: QuestDifficulty[] = ['easy', 'medium', 'hard', 'epic']

export const QUEST_TITLE_MAX = 80
export const QUEST_DESC_MAX = 400

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateCreateQuest(payload: unknown): ValidationResult {
  const errors: Record<string, string> = {}

  if (typeof payload !== 'object' || payload === null) {
    return { valid: false, errors: { _: 'Invalid payload' } }
  }

  const p = payload as Record<string, unknown>

  // title
  if (!p.title || typeof p.title !== 'string' || p.title.trim().length === 0) {
    errors.title = 'Quest title is required.'
  } else if (p.title.trim().length > QUEST_TITLE_MAX) {
    errors.title = `Title must be ${QUEST_TITLE_MAX} characters or fewer.`
  }

  // description (optional)
  if (p.description !== undefined && p.description !== null) {
    if (typeof p.description !== 'string') {
      errors.description = 'Description must be text.'
    } else if (p.description.length > QUEST_DESC_MAX) {
      errors.description = `Description must be ${QUEST_DESC_MAX} characters or fewer.`
    }
  }

  // category
  if (!p.category || !VALID_CATEGORIES.includes(p.category as QuestCategory)) {
    errors.category = 'Choose a valid quest category.'
  }

  // difficulty
  if (!p.difficulty || !VALID_DIFFICULTIES.includes(p.difficulty as QuestDifficulty)) {
    errors.difficulty = 'Choose a valid difficulty.'
  }

  // due_date (optional ISO date)
  if (p.due_date !== undefined && p.due_date !== null && p.due_date !== '') {
    const d = new Date(p.due_date as string)
    if (isNaN(d.getTime())) {
      errors.due_date = 'Invalid due date.'
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateUpdateQuest(payload: unknown): ValidationResult {
  const errors: Record<string, string> = {}

  if (typeof payload !== 'object' || payload === null) {
    return { valid: false, errors: { _: 'Invalid payload' } }
  }

  const p = payload as Record<string, unknown>

  if (p.title !== undefined) {
    if (typeof p.title !== 'string' || p.title.trim().length === 0) {
      errors.title = 'Quest title cannot be empty.'
    } else if (p.title.trim().length > QUEST_TITLE_MAX) {
      errors.title = `Title must be ${QUEST_TITLE_MAX} characters or fewer.`
    }
  }

  if (p.description !== undefined && p.description !== null) {
    if (typeof p.description !== 'string') {
      errors.description = 'Description must be text.'
    } else if ((p.description as string).length > QUEST_DESC_MAX) {
      errors.description = `Description must be ${QUEST_DESC_MAX} characters or fewer.`
    }
  }

  if (p.category !== undefined && !VALID_CATEGORIES.includes(p.category as QuestCategory)) {
    errors.category = 'Invalid category.'
  }

  if (p.difficulty !== undefined && !VALID_DIFFICULTIES.includes(p.difficulty as QuestDifficulty)) {
    errors.difficulty = 'Invalid difficulty.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
