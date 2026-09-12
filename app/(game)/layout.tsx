/**
 * Shared layout for all game routes: /world, /quests, /character, /loot, /party.
 * Server Component — fetches the authenticated profile and passes it to the nav.
 * Proxy middleware already handles the auth redirect before this runs.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GameNav } from '@/components/game/GameNav'
import type { Profile } from '@/types/database'

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Belt-and-suspenders: proxy should have redirected already
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-deepest)' }}>
      <GameNav profile={profile} />

      <main
        className="flex-1 min-w-0 pb-20 md:pb-0"
        id="main-content"
      >
        {children}
      </main>
    </div>
  )
}
