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

  const { data: initialProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  let profile = initialProfile

  if (profileError && profileError.code === 'PGRST116') {
    // The profile trigger handles new accounts. Keep this path for accounts
    // created before the trigger existed, using a collision-proof username.
    const fallbackUsername = `hero_${user.id.slice(0, 8)}`
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          username: fallbackUsername,
          display_name: user.user_metadata?.username ?? null,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single<Profile>()

    if (createError) {
      console.error('Profile bootstrap failed:', createError)
      redirect('/login?error=profile_setup_failed')
    }

    profile = createdProfile
  }

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
