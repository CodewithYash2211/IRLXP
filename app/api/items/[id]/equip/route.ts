/**
 * POST /api/items/[id]/equip
 * Full implementation: Phase 8.
 */

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ message: 'Equip API — Phase 8' }, { status: 501 })
}
