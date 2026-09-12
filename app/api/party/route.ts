import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePartyAction } from '@/lib/validation/party'

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to access your party.' }, { status: 401 })

  let input: ReturnType<typeof validatePartyAction>
  try {
    input = validatePartyAction(await request.json())
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request.' }, { status: 400 })
  }
  const { error } = await supabase.rpc('party_action', { p_action: input.action, p_payload: input.payload })
  if (error) {
    const expected = ['22023', '42501'].includes(error.code)
    return NextResponse.json({ error: expected ? error.message : 'Party action could not be saved. Please refresh and try again.' }, { status: error.code === '42501' ? 403 : expected ? 400 : 500 })
  }
  return NextResponse.json({ success: true })
}
