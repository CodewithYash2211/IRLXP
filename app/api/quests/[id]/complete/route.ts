/**
 * POST /api/quests/[id]/complete
 * Server-authoritative quest completion.
 * Full implementation: Phase 4.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const resolvedParams = await params
    console.log('complete route: questId', resolvedParams.id)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the authoritative complete_quest RPC
    const { data, error } = await supabase.rpc('complete_quest', {
      p_quest_id: resolvedParams.id,
      p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    })
    console.log('RPC result', { data, error })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
