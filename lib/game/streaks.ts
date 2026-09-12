/**
 * IRLXP — Streak calculation utilities.
 *
 * Streak is based on the user's local date (via their stored timezone),
 * not raw UTC timestamps. The profile stores:
 *   - last_activity_date: YYYY-MM-DD in the user's timezone
 *   - timezone: IANA timezone string (e.g. 'Asia/Kolkata')
 *
 * Streak rules:
 *   - First quest of the day: streak continues or increments
 *   - Missed a day: streak resets to 1
 *   - Multiple quests in a day: streak only increments once per day
 */

/**
 * Get today's date string (YYYY-MM-DD) in a given IANA timezone.
 */
export function getTodayInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  } catch {
    // Fallback to UTC if timezone is invalid
    return new Date().toISOString().slice(0, 10)
  }
}

/**
 * Calculate the new streak count given the previous activity date and current date.
 *
 * @param lastActivityDate - YYYY-MM-DD of the last recorded activity, or null
 * @param today            - YYYY-MM-DD of today in the user's timezone
 * @param currentStreak    - The user's current streak count
 * @returns Updated streak count
 */
export function calculateNewStreak(
  lastActivityDate: string | null,
  today: string,
  currentStreak: number
): number {
  if (!lastActivityDate) {
    // First ever activity
    return 1
  }

  if (lastActivityDate === today) {
    // Already active today — streak doesn't change
    return currentStreak
  }

  const last = new Date(lastActivityDate)
  const todayDate = new Date(today)

  // Difference in days (dates are midnight UTC since they're YYYY-MM-DD)
  const diffMs = todayDate.getTime() - last.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    // Consecutive day — increment streak
    return currentStreak + 1
  }

  // Gap of 2+ days — reset
  return 1
}

/**
 * Returns true if the user has already been active today (streak was credited).
 */
export function isActiveToday(lastActivityDate: string | null, timezone: string): boolean {
  if (!lastActivityDate) return false
  return lastActivityDate === getTodayInTimezone(timezone)
}
