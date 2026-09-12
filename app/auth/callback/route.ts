/**
 * /auth/callback — exchanges the Supabase auth `code` (from email confirmation
 * or OAuth) for a server-side session, then redirects the user into the game.
 *
 * Supabase sends the user here after they click the confirmation link in their
 * sign-up email. Set the "Site URL" and "Redirect URLs" in Supabase Auth settings
 * to include: <your-domain>/auth/callback
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/world'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful confirmation — enter the game
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send back to login with an error param
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
