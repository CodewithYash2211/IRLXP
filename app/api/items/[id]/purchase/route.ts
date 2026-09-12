/**
 * POST /api/items/[id]/purchase
 * Server-authoritative item purchase.
 * Full implementation: Phase 8.
 */

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ message: 'Purchase API — Phase 8' }, { status: 501 })
}
