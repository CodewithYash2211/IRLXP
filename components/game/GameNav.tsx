'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getLevelInfo } from '@/lib/game/progression'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

// ─── Nav items ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/world',     label: 'WORLD',     icon: '🌎' },
  { href: '/quests',    label: 'QUESTS',    icon: '⚔️'  },
  { href: '/character', label: 'CHARACTER', icon: '🧍'  },
  { href: '/loot',      label: 'LOOT',      icon: '🏪'  },
  { href: '/party',     label: 'PARTY',     icon: '👥'  },
] as const

// ─── Component ───────────────────────────────────────────────────────────────

interface GameNavProps {
  profile: Profile | null
}

export function GameNav({ profile }: GameNavProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const levelInfo = profile ? getLevelInfo(profile.total_xp) : null

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-56 min-h-screen border-r"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/world" className="block">
            <div className="font-pixel text-[10px] text-gold glow-gold leading-relaxed">
              IRLXP
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              LEVEL UP YOUR REAL LIFE
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Game navigation">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold',
                  'transition-all duration-150 group',
                  active
                    ? 'bg-[var(--xp-bar)]/20 text-[var(--text-primary)] border border-[var(--xp-bar)]/30'
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] border border-transparent'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-base w-5 text-center">{icon}</span>
                <span className="font-pixel text-[9px] tracking-wider">{label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--xp-fill)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User profile at bottom */}
        {profile && levelInfo && (
          <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
            {/* XP bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-pixel text-[8px] text-gold">LV.{levelInfo.level}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {levelInfo.currentLevelXP}/{levelInfo.nextLevelXP} XP
                </span>
              </div>
              <div className="xp-bar-track h-1.5">
                <div
                  className="xp-bar-fill h-full"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>

            <p className="text-xs">🔥 STREAK {profile.streak_count} {profile.streak_count === 1 ? 'DAY' : 'DAYS'}</p>
            <dl className="grid grid-cols-2 gap-2 text-[10px]">
              {(['intellect', 'strength', 'discipline', 'vitality'] as const).map(attribute => (
                <div key={attribute} style={{ color: `var(--${attribute})` }}>
                  <dt className="uppercase">{attribute}</dt>
                  <dd>{profile[attribute]}</dd>
                </div>
              ))}
            </dl>

            {/* Username + coins */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {profile.username}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  🪙 {profile.coins.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs px-2 py-1 rounded btn-ghost"
                aria-label="Sign out"
              >
                ↩
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Mobile bottom bar ────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
        }}
        aria-label="Game navigation"
      >
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5',
                'transition-colors duration-150',
                active
                  ? 'text-[var(--xp-fill)]'
                  : 'text-[var(--text-muted)]'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[8px] font-pixel">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
