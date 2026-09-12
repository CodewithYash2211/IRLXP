/**
 * GET  /api/quests — list user's quests
 * POST /api/quests — create a new quest
 * Full implementation: Phase 3.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCreateQuest } from '@/lib/validation/quest'
import { getRewardPreview } from '@/lib/game/rewards'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const { valid, errors } = validateCreateQuest(payload)

    if (!valid) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    const rewards = getRewardPreview(payload.difficulty)

    const { data, error } = await supabase
      .from('quests')
      .insert({
        user_id: user.id,
        title: payload.title,
        description: payload.description || null,
        category: payload.category,
        difficulty: payload.difficulty,
        due_date: payload.due_date || null,
        xp_reward: rewards.xp,
        coin_reward: rewards.coins,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
