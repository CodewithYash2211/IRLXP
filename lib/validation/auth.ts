/**
 * Auth input validation — signup form.
 */

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export interface AuthValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateSignup(payload: {
  email: unknown
  password: unknown
  username: unknown
}): AuthValidationResult {
  const errors: Record<string, string> = {}

  // email
  if (!payload.email || typeof payload.email !== 'string' || !payload.email.includes('@')) {
    errors.email = 'A valid email address is required.'
  }

  // password
  if (!payload.password || typeof payload.password !== 'string') {
    errors.password = 'Password is required.'
  } else if ((payload.password as string).length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  // username
  if (!payload.username || typeof payload.username !== 'string') {
    errors.username = 'Username is required.'
  } else if (!USERNAME_REGEX.test(payload.username as string)) {
    errors.username = 'Username must be 3–20 characters: letters, numbers, underscore only.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
