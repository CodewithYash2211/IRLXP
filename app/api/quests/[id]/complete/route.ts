/**
 * POST /api/quests/[id]/complete
 * Server-authoritative quest completion.
 * Full implementation: Phase 4.
 */

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ message: 'Complete API — Phase 4' }, { status: 501 })
}
