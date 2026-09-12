/**
 * PUT    /api/quests/[id] — update quest
 * DELETE /api/quests/[id] — delete quest
 * Full implementation: Phase 3.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateUpdateQuest } from '@/lib/validation/quest'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const resolvedParams = await params

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const { valid, errors } = validateUpdateQuest(payload)

    if (!valid) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    // Only allow update if quest is active and belongs to user
    const { data: quest, error: fetchError } = await supabase
      .from('quests')
      .select('status')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    if (quest.status !== 'active') {
      return NextResponse.json({ error: 'Can only edit active quests' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (payload.title !== undefined) updateData.title = payload.title
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.category !== undefined) updateData.category = payload.category
    if (payload.difficulty !== undefined) updateData.difficulty = payload.difficulty
    if (payload.due_date !== undefined) updateData.due_date = payload.due_date

    // Note: We don't recalculate rewards on update per requirements "Rewards locked at creation time"
    const { data, error } = await supabase
      .from('quests')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
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

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const resolvedParams = await params

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow delete if quest is active and belongs to user
    const { data: quest, error: fetchError } = await supabase
      .from('quests')
      .select('status')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    if (quest.status !== 'active') {
      return NextResponse.json({ error: 'Can only delete active quests' }, { status: 400 })
    }

    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
