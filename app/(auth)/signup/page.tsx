'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateSignup, USERNAME_REGEX } from '@/lib/validation/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthScenery } from '@/components/game/AuthScenery'

export default function SignupPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  function validateField(field: string, value: string) {
    // Live validation per field
    if (field === 'username' && value && !USERNAME_REGEX.test(value)) {
      setErrors((p) => ({ ...p, username: '3–20 chars: letters, numbers, _ only' }))
    } else if (field === 'password' && value && value.length < 8) {
      setErrors((p) => ({ ...p, password: 'At least 8 characters required' }))
    } else {
      setErrors((p) => { const n = { ...p }; delete n[field]; return n })
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setServerError(null)

    // Full validation
    const result = validateSignup({ email, password, username })
    if (!result.valid) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email:    email.trim(),
      password,
      options: {
        data: { username: username.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      console.error('Signup Auth Error:', authError)
      // Map common Supabase/DB errors to friendly messages
      const msg = authError.message.toLowerCase()
      if (msg.includes('username') || msg.includes('unique') || msg.includes('duplicate')) {
        setErrors({ username: 'That username is already taken. Choose another.' })
      } else if (msg.includes('already registered')) {
        setErrors({ email: 'An account with this email already exists.' })
      } else {
        setServerError(authError.message)
      }
      setLoading(false)
      return
    }

    // If session is immediately available, email confirmation is disabled → go straight in
    if (data.session) {
      router.push('/world')
      router.refresh()
      return
    }

    // Otherwise email confirmation is enabled → show success state
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="auth-page relative min-h-screen flex items-center justify-center p-4">
        <AuthScenery />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-gold/20 via-transparent to-xp-bar/20 rounded-[14px] blur-xl" aria-hidden="true" />
            <div className="relative game-panel pixel-border-gold rounded-xl p-8 space-y-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
                <span className="font-pixel text-[8px] text-gold tracking-widest">HERO CREATED</span>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
              </div>
              <div className="text-5xl mb-2 animate-float">📬</div>
              <h2 className="font-pixel text-sm text-gold">CHECK YOUR EMAIL</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                Click it to unlock your adventure.
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Already confirmed?{' '}
                <Link href="/login" className="underline" style={{ color: 'var(--xp-fill)' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page relative min-h-screen flex items-center justify-center p-4">
      <AuthScenery />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="block">
            <h1 className="font-pixel text-xl md:text-2xl text-gold glow-gold mb-2 inline-block">
              IRLXP
            </h1>
          </Link>
          <p className="font-pixel text-[9px] tracking-widest" style={{ color: 'var(--text-muted)' }}>
            CREATE YOUR HERO
          </p>
        </div>

        {/* RPG-style frame */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-br from-gold/20 via-transparent to-xp-bar/20 rounded-[14px] blur-xl" aria-hidden="true" />
          <div className="relative game-panel pixel-border-gold rounded-xl p-6 md:p-8 space-y-6">
            {/* Top decoration */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
              <span className="font-pixel text-[8px] text-gold tracking-widest">HERO REGISTRY</span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
            </div>

            <div className="text-center">
              <h2 className="font-semibold text-lg md:text-xl" style={{ color: 'var(--text-primary)' }}>
                Forge Your Legend
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Every hero begins with a name. What will yours be?
              </p>
            </div>

            {serverError && (
              <div
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg border text-sm animate-xp-fly"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  borderColor: 'rgba(239,68,68,0.3)',
                  color: 'var(--strength)',
                }}
                role="alert"
              >
                <span>⚠</span>
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Username"
                type="text"
                autoComplete="username"
                placeholder="epic_hero_42"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  validateField('username', e.target.value)
                }}
                error={errors.username}
                hint="3–20 characters: letters, numbers, underscore"
                required
                disabled={loading}
                maxLength={20}
              />

              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="hero@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  validateField('password', e.target.value)
                }}
                error={errors.password}
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
                CREATE HERO →
              </Button>
            </form>

            <div className="text-center pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Already have a hero?{' '}
                <Link
                  href="/login"
                  className="font-semibold underline underline-offset-2"
                  style={{ color: 'var(--xp-fill)' }}
                >
                  Enter the realm
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] mt-6" style={{ color: 'var(--text-muted)' }}>
          🔒 Your data is secure. XP is earned, never bought.
        </p>
      </div>
    </div>
  )
}
