import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuestEngine } from './QuestComponents'

export default async function QuestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <QuestEngine initialQuests={quests || []} />
}
