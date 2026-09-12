/**
 * PUT    /api/quests/[id] — update quest
 * DELETE /api/quests/[id] — delete quest
 * Full implementation: Phase 3.
 */

import { NextResponse } from 'next/server'

export async function PUT() {
  return NextResponse.json({ message: 'Quest API — Phase 3' }, { status: 501 })
}

export async function DELETE() {
  return NextResponse.json({ message: 'Quest API — Phase 3' }, { status: 501 })
}
