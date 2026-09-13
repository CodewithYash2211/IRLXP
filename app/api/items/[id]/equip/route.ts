import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid item' }, { status: 400 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
  const { data, error } = await supabase.rpc('equip_item', { p_item_id: id })
  if (error) {
    const message = error.code === '23505' ? 'You already own this item.' :
      ['Insufficient coins', 'Item not owned', 'Item not found'].find(value => error.message.includes(value)) ?? 'Unable to complete this action. Please try again.'
    return NextResponse.json({ error: message }, { status: error.code === '23505' ? 409 : 400 })
  }

  // Mirror the equipped cosmetic onto the profile so every character render
  // (character sheet, world hero) shows it. profiles.avatar_accessory is the
  // persisted field HeroSprite reads; the RPC keeps inventory.equipped true.
  let avatarSynced = true
  const { data: item } = await supabase
    .from('items')
    .select('category, asset_key')
    .eq('id', id)
    .single()
  if (item?.category === 'accessories') {
    const { error: syncError } = await supabase
      .from('profiles')
      .update({ avatar_accessory: item.asset_key })
      .eq('id', user.id)
    if (syncError) {
      avatarSynced = false
      console.warn('[equip] inventory equipped but profile avatar sync failed:', syncError.message)
    }
  }

  return NextResponse.json({ ...(data as Record<string, unknown>), avatarSynced })
}
