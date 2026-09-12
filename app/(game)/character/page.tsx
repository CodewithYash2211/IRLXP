import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AvatarEditor } from '@/components/game/AvatarEditor'
import type { InventoryItem, Profile } from '@/types/database'

export default async function CharacterPage() {
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

  const { data: inventory } = await supabase
    .from('inventory')
    .select('*, item:items(*)')
    .eq('user_id', currentUser.id)
    .order('purchased_at', { ascending: false })

  return (
    <AvatarEditor
      // The editor is local state-driven and intentionally does not depend on the
      // legacy shop panel data. The existing auth/profile guard remains in place.
    />
  )
}
