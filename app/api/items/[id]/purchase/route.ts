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
  const { data, error } = await supabase.rpc('purchase_item', { p_item_id: id })
  if (error) {
    const message = error.code === '23505' ? 'You already own this item.' :
      ['Insufficient coins', 'Item not owned', 'Item not found'].find(value => error.message.includes(value)) ?? 'Unable to complete this action. Please try again.'
    return NextResponse.json({ error: message }, { status: error.code === '23505' ? 409 : 400 })
  }
  return NextResponse.json(data)
}
