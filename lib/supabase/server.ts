/**
 * Server-side Supabase client.
 * Used in Server Components, Route Handlers, and Server Actions.
 * Reads/writes session from cookies. No service role key required.
 *
 * Always call createClient() — do NOT cache the instance across requests.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — cookies are read-only.
            // Session refresh is handled by middleware.
          }
        },
      },
    }
  )
}
