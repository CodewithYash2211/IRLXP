/**
 * Landing page — public, SEO-friendly.
 * Full implementation comes in Phase 9.
 * This stub redirects authenticated users and shows a basic landing for others.
 */

import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-deepest)' }}>
      <div className="text-center max-w-2xl">
        <div className="font-pixel text-xs mb-4" style={{ color: 'var(--text-gold)' }}>
          ⚔️ LEVEL UP YOUR REAL LIFE ⚔️
        </div>
        <h1 className="font-pixel text-2xl md:text-4xl mb-4" style={{ color: 'var(--gold)', lineHeight: 1.4 }}>
          IRLXP
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          Turn your everyday goals into epic quests. Earn XP, level up, and make real-life progress feel like an adventure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="btn-gold px-8 py-3 text-sm font-bold rounded-lg inline-block"
          >
            START YOUR ADVENTURE →
          </Link>
          <Link
            href="/login"
            className="btn-ghost px-8 py-3 text-sm rounded-lg inline-block"
          >
            CONTINUE QUEST
          </Link>
        </div>
      </div>
    </main>
  )
}
