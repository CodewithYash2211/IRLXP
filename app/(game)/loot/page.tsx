import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AvatarShopPanel } from '@/components/game/AvatarShopPanel'
import type { InventoryItem, Item, Profile } from '@/types/database'

export default async function LootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentUser = user

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single<Profile>()

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .order('price', { ascending: true })

  const { data: inventory } = await supabase
    .from('inventory')
    .select('*, item:items(*)')
    .eq('user_id', currentUser.id)
    .order('purchased_at', { ascending: false })

  return (
    <AvatarShopPanel
      mode="shop"
      initialProfile={profile ?? null}
      initialItems={(items as Item[] | null) ?? []}
      initialInventory={(inventory as InventoryItem[] | null) ?? []}
    />
  )
}
