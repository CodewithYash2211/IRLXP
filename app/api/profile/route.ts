/**
 * GET /api/profile  — fetch authenticated user's profile
 * PUT /api/profile  — update profile fields
 * Full implementation: Phase 1.
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Profile API — Phase 1' }, { status: 501 })
}

export async function PUT() {
  return NextResponse.json({ message: 'Profile API — Phase 1' }, { status: 501 })
}
