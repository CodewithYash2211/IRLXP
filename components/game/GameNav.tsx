'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getLevelInfo } from '@/lib/game/progression'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/world',     label: 'WORLD',     icon: '🌍', key: 'world' },
  { href: '/quests',    label: 'QUESTS',    icon: '⚔️',  key: 'quests' },
  { href: '/character', label: 'HERO',      icon: '🧍',  key: 'character' },
  { href: '/loot',      label: 'SHOP',      icon: '🏪',  key: 'loot' },
  { href: '/party',     label: 'PARTY',     icon: '👥',  key: 'party' },
] as const

interface GameNavProps {
  profile: Profile | null
}

export function GameNav({ profile }: GameNavProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

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
        className="hidden md:flex flex-col w-56 min-h-screen border-r relative"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          flexShrink: 0,
        }}
        aria-label="Game navigation"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xp-bar/30 to-transparent" />
        </div>

        {/* Logo */}
        <div className="px-5 py-6 border-b relative" style={{ borderColor: 'var(--border)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-transparent to-transparent" aria-hidden="true" />
          <Link href="/world" className="block relative z-10">
            <div className="font-pixel text-[10px] text-gold glow-gold leading-relaxed">
              IRLXP
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              LEVEL UP YOUR REAL LIFE
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, icon, key }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold',
                  'transition-all duration-200 group overflow-hidden',
                  active
                    ? 'bg-[var(--xp-bar)]/15 text-[var(--text-primary)] border border-[var(--xp-bar)]/30'
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] border border-transparent'
                )}
                aria-current={active ? 'page' : undefined}
                onMouseEnter={() => setHoveredItem(key)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span className="text-base w-6 text-center relative z-10 transition-transform duration-200 group-hover:scale-110">
                  {icon}
                </span>
                <span className="font-pixel text-[9px] tracking-wider relative z-10">{label}</span>
                {active && (
                  <>
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold to-xp-fill" />
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--xp-fill)] animate-glow relative z-10" />
                  </>
                )}
                <AnimatePresence>
                  {hoveredItem === key && !active && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-gradient-to-r from-gold/5 to-xp-bar/5 rounded-lg pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* User profile at bottom */}
        {profile && levelInfo && (
          <div className="border-t px-4 py-4 space-y-4 relative" style={{ borderColor: 'var(--border)' }}>
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden="true" />

            {/* XP bar with level */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-pixel text-[8px] text-gold">LV.{levelInfo.level}</span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {levelInfo.currentLevelXP.toLocaleString()} / {levelInfo.nextLevelXP.toLocaleString()} XP
                </span>
              </div>
              <div className="xp-bar-track h-2 relative overflow-visible" role="progressbar" aria-label="Progress to next level" aria-valuenow={levelInfo.progressPercent} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="xp-bar-fill h-full relative"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_var(--xp-glow)]" />
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid var(--border-gold)' }}>
              <span className="text-base animate-float">🔥</span>
              <span className="font-pixel text-[8px] text-gold">STREAK</span>
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {profile.streak_count} {profile.streak_count === 1 ? 'DAY' : 'DAYS'}
              </span>
            </div>

            {/* Attributes compact */}
            <dl className="grid grid-cols-2 gap-2 text-[9px] px-1">
              {(['intellect', 'strength', 'discipline', 'vitality'] as const).map(attribute => (
                <div key={attribute} className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: `rgba(0,0,0,0.2)` }}>
                  <span style={{ color: `var(--${attribute})` }}>
                    {attribute === 'intellect' && '🧠'}
                    {attribute === 'strength' && '⚔️'}
                    {attribute === 'discipline' && '🛡️'}
                    {attribute === 'vitality' && '❤️'}
                  </span>
                  <dt className="uppercase font-pixel" style={{ color: 'var(--text-muted)' }}>
                    {attribute.slice(0, 3)}
                  </dt>
                  <dd className="font-bold ml-auto" style={{ color: `var(--${attribute})` }}>
                    {profile[attribute]}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Username + coins */}
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile.username}
                </p>
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <span>🪙</span>
                  {profile.coins.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs px-2 py-1 rounded btn-ghost hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
                aria-label="Sign out"
                title="Sign out"
              >
                ↩
              </button>
            </div>
          </div>
        )}

        {/* Version badge */}
        <div className="px-4 pb-4 text-center">
          <span className="font-pixel text-[7px]" style={{ color: 'var(--text-muted)' }}>
            v0.7.0 • PHASE 7
          </span>
        </div>
      </aside>

      {profile && levelInfo && <div className="mobile-hud md:hidden"><Link href="/character">LV.{levelInfo.level} · {profile.username}</Link><span>{profile.coins.toLocaleString()} 🪙</span><span>{profile.streak_count} 🔥</span><button onClick={handleSignOut} aria-label="Sign out" className="px-2">↩</button><div className="xp-bar-track"><div className="xp-bar-fill" style={{width: `${levelInfo.progressPercent}%`, height: '100%'}} /></div></div>}
      {/* ── Mobile bottom bar ────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
        }}
        aria-label="Game navigation"
        role="navigation"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden="true" />
        <div className="relative flex">
          {NAV_ITEMS.map(({ href, label, icon, key }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  'relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5',
                  'transition-all duration-200',
                  active
                    ? 'text-[var(--xp-fill)]'
                    : 'text-[var(--text-muted)] active:text-[var(--xp-fill)]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-xl leading-none relative z-10 transition-transform active:scale-110">{icon}</span>
                <span className="text-[8px] font-pixel tracking-wider relative z-10">{label}</span>
                {active && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-gold to-xp-fill rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
