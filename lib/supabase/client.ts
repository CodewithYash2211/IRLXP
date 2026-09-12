/**
 * Browser-side Supabase client.
 * Used in Client Components ('use client').
 * Persists session in cookies via @supabase/ssr.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder-project.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
