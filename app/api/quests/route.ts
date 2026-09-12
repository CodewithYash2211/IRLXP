/**
 * GET  /api/quests — list user's quests
 * POST /api/quests — create a new quest
 * Full implementation: Phase 3.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Quest API — Phase 3' }, { status: 501 })
}

export async function POST() {
  return NextResponse.json({ message: 'Quest API — Phase 3' }, { status: 501 })
}
