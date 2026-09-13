'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthScenery } from '@/components/game/AuthScenery'

// ─── Inner form — uses useSearchParams, wrapped in Suspense below ────────────

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(
    searchParams.get('error') === 'auth_callback_failed'
      ? 'Email confirmation failed. Please try again.'
      : searchParams.get('error') === 'profile_setup_failed'
        ? 'We could not load your hero profile. Please try again in a moment.'
      : null
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    })

    if (authError) {
      setError(
        authError.message.toLowerCase().includes('invalid login')
          ? 'Wrong email or password. Try again, hero.'
          : authError.message
      )
      setLoading(false)
      return
    }

    const redirectTo = searchParams.get('redirectTo') ?? '/world'
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="block">
          <h1 className="font-pixel text-xl md:text-2xl text-gold glow-gold mb-2 inline-block">
            IRLXP
          </h1>
        </Link>
        <p className="font-pixel text-[9px] tracking-widest" style={{ color: 'var(--text-muted)' }}>
          ENTER THE REALM
        </p>
      </div>

      {/* RPG-style frame */}
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-br from-gold/20 via-transparent to-xp-bar/20 rounded-[14px] blur-xl" aria-hidden="true" />
        <div className="relative game-panel pixel-border-gold rounded-xl p-6 md:p-8 space-y-6">
          {/* Top decoration */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
            <span className="font-pixel text-[8px] text-gold tracking-widest">HERO LOGIN</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
          </div>

          <div className="text-center">
            <h2 className="font-semibold text-lg md:text-xl" style={{ color: 'var(--text-primary)' }}>
              Welcome back, Hero
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Your adventure awaits beyond these gates.
            </p>
          </div>

          {error && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-lg border text-sm animate-xp-fly"
              style={{
                background: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.3)',
                color: 'var(--strength)',
              }}
              role="alert"
            >
              <span aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="hero@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={loading}
              className="w-full font-pixel text-[10px] tracking-widest mt-2"
            >
              ENTER THE REALM →
            </Button>
          </form>

          <div className="text-center pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No hero profile yet?{' '}
              <Link
                href="/signup"
                className="font-semibold underline underline-offset-2 transition-colors"
                style={{ color: 'var(--xp-fill)' }}
              >
                CREATE YOUR HERO
              </Link>
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] mt-6" style={{ color: 'var(--text-muted)' }}>
        ⚡ Your XP and quests are waiting.
      </p>
    </div>
  )
}

// ─── Fallback shown while Suspense resolves ──────────────────────────────────

function LoginSkeleton() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="text-center mb-8">
        <div className="font-pixel text-xl text-gold glow-gold mb-2">IRLXP</div>
        <div className="font-pixel text-[9px]" style={{ color: 'var(--text-muted)' }}>
          ENTER THE REALM
        </div>
      </div>
      <div className="game-panel pixel-border-gold rounded-xl p-6 md:p-8">
        <div className="skeleton h-6 w-40 mx-auto mb-2 rounded" />
        <div className="skeleton h-4 w-24 mx-auto mb-6 rounded" />
        <div className="space-y-4">
          <div className="skeleton h-10 rounded-lg" />
          <div className="skeleton h-10 rounded-lg" />
          <div className="skeleton h-11 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ─── Page export — Suspense wraps the searchParams consumer ─────────────────

export default function LoginPage() {
  return (
    <div className="auth-page relative min-h-screen flex items-center justify-center p-4">
      <AuthScenery />
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
