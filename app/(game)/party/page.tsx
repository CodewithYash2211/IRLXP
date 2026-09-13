import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PartyState } from '@/types/party'
import { PartyScreen } from './PartyScreen'

export default async function PartyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data, error } = await supabase.rpc('get_party_state')
  return <PartyScreen userId={user.id} state={error ? null : data as PartyState} loadError={Boolean(error)} />
}
