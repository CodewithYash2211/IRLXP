type Payload = Record<string, unknown>
export type PartyAction = 'create' | 'join' | 'leave' | 'create_challenge' | 'participate' | 'progress'

function record(value: unknown): Payload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid request.')
  return value as Payload
}
function text(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    throw new Error(`${label} must be ${min}–${max} characters.`)
  }
  return value.trim()
}
function integer(value: unknown, label: string, min: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > 1000000) {
    throw new Error(`${label} must be a whole number from ${min} to 1,000,000.`)
  }
  return value
}
function date(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
    throw new Error('Enter a valid start and end date.')
  }
  return value
}

// Whitelist fields, including when clients send user_id or party_id.
export function validatePartyAction(value: unknown): { action: PartyAction; payload: Payload } {
  const body = record(value)
  const payload = record(body.payload ?? {})
  switch (body.action) {
    case 'create': return { action: body.action, payload: { name: text(payload.name, 'Party name', 2, 40) } }
    case 'join': {
      const code = text(payload.code, 'Party code', 18, 18).toUpperCase()
      if (!/^IRLXP-[0-9A-F]{12}$/.test(code)) throw new Error('Enter a valid IRLXP party code.')
      return { action: body.action, payload: { code } }
    }
    case 'leave': return { action: body.action, payload: {} }
    case 'create_challenge': {
      const start = date(payload.start_date)
      const end = date(payload.end_date)
      if (end < start || Date.parse(end) - Date.parse(start) > 365 * 86400000) throw new Error('End date must be within 365 days of the start date.')
      return { action: body.action, payload: {
        title: text(payload.title, 'Title', 2, 80),
        description: text(payload.description ?? '', 'Description', 0, 400),
        target: integer(payload.target, 'Target', 1), unit: text(payload.unit, 'Unit', 1, 30), start_date: start, end_date: end,
      } }
    }
    case 'participate':
    case 'progress': {
      const id = text(payload.challenge_id, 'Challenge ID', 36, 36)
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error('Invalid challenge ID.')
      return { action: body.action, payload: { challenge_id: id, ...(body.action === 'progress' ? { progress: integer(payload.progress, 'Progress', 0) } : {}) } }
    }
    default: throw new Error('Unknown party action.')
  }
}
