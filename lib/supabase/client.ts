/**
 * Browser-side Supabase client.
 * Used in Client Components ('use client').
 * Persists session in cookies via @supabase/ssr.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
