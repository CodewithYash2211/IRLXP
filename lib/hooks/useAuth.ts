'use client'

/**
 * useAuth — reactive access to the current Supabase session and user.
 *
 * Listens to onAuthStateChange so the UI updates immediately after
 * sign-in, sign-out, or token refresh — no manual polling needed.
 *
 * Use this inside Client Components that need the auth state.
 * Server Components should call createClient() from lib/supabase/server.ts.
 */

import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()

    // Get current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false })
    })

    // Subscribe to future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({ user: session?.user ?? null, session, loading: false })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return state
}
