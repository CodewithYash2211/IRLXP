// Isolated PostgreSQL integration tests. Never connects to the live database.
// Usage: node scripts/test-party.mjs <absolute path to @electric-sql/pglite/dist/index.js>
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

const { PGlite } = await import(pathToFileURL(process.argv[2]).href)
const db = new PGlite()
let checks = 0
const ids = Array.from({ length: 10 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`)
await db.exec(`
  CREATE ROLE anon; CREATE ROLE authenticated;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users(id uuid PRIMARY KEY);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  GRANT USAGE ON SCHEMA auth TO authenticated, anon;
  GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, anon;
  CREATE TABLE public.profiles(id uuid PRIMARY KEY REFERENCES auth.users(id), username text, display_name text, total_xp integer, coins integer);
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  GRANT SELECT ON public.profiles TO authenticated;
  CREATE POLICY own_profile ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
`)
for (let i = 0; i < ids.length; i++) {
  await db.query('INSERT INTO auth.users VALUES ($1)', [ids[i]])
  await db.query('INSERT INTO public.profiles VALUES ($1, $2, null, $3, 42)', [ids[i], `Hero${i + 1}`, i * 100])
}
await db.exec(readFileSync(new URL('../supabase/phase6.sql', import.meta.url), 'utf8'))
async function asUser(index, fn) {
  await db.exec('SET ROLE authenticated')
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [index === null ? '' : ids[index]])
  try { return await fn() } finally { await db.exec('RESET ROLE') }
}
async function act(index, action, payload = {}) {
  return asUser(index, () => db.query('SELECT public.party_action($1, $2::jsonb)', [action, JSON.stringify(payload)]))
}
async function state(index) {
  return asUser(index, async () => (await db.query('SELECT public.get_party_state() AS state')).rows[0].state)
}
async function rejects(fn, pattern) { await assert.rejects(fn, pattern); checks++ }
function check(value, expected) { assert.deepEqual(value, expected); checks++ }

check((await state(0)).party, null)
await rejects(() => act(null, 'create', { name: 'Anonymous' }), /Sign in/)
await db.exec('SET ROLE anon')
await rejects(() => db.query('SELECT public.get_party_state()'), /permission denied/)
await db.exec('RESET ROLE')
await act(0, 'create', { name: 'Test Heroes' })
const first = await state(0)
check(first.members.length, 1)
const code = first.party.invite_code
check(/^IRLXP-[0-9A-F]{12}$/.test(code), true)
await rejects(() => act(0, 'create', { name: 'Duplicate' }), /already belong/)
await rejects(() => act(1, 'join', { code: 'IRLXP-INVALID' }), /Invalid party code/)
await act(1, 'join', { code: code.toLowerCase() })
check((await state(1)).members.length, 2)
check('coins' in (await state(1)).members[0], false)
check((await asUser(2, () => db.query('SELECT * FROM public.parties'))).rows.length, 0)
check((await asUser(2, () => db.query('SELECT * FROM public.party_memberships'))).rows.length, 0)
check((await asUser(1, () => db.query('SELECT * FROM public.profiles'))).rows.length, 1)
await rejects(() => asUser(1, () => db.query('DELETE FROM public.party_memberships')), /permission denied/)
const today = first.today
await act(0, 'create_challenge', { title: 'Read pages', description: 'Read together', target: 10, unit: 'pages', start_date: today, end_date: today })
const challenge = (await state(0)).challenges[0]
check(challenge.participants.length, 1)
await rejects(() => act(2, 'progress', { challenge_id: challenge.id, progress: 10 }), /Join a party/)
await rejects(() => act(1, 'progress', { challenge_id: challenge.id, progress: 10 }), /Participate before/)
await act(1, 'participate', { challenge_id: challenge.id })
await act(1, 'participate', { challenge_id: challenge.id })
check((await state(0)).challenges[0].participants.length, 2)
await act(0, 'progress', { challenge_id: challenge.id, progress: 5, user_id: ids[1] })
check((await state(1)).challenges[0].participants.find(p => p.user_id === ids[1]).progress, 0)
check((await state(0)).challenges[0].participants.find(p => p.user_id === ids[0]).progress, 5)
await rejects(() => act(0, 'progress', { challenge_id: challenge.id, progress: 11 }), /between zero/)
await rejects(() => act(0, 'progress', { challenge_id: challenge.id, progress: -1 }), /between zero/)
await rejects(() => asUser(1, () => db.query('UPDATE public.party_challenge_progress SET progress = 10')), /permission denied/)
await act(0, 'progress', { challenge_id: challenge.id, progress: 10 })
check((await state(0)).challenges[0].status, 'active')
await act(1, 'progress', { challenge_id: challenge.id, progress: 10 })
check((await state(0)).challenges[0].status, 'completed')
check((await state(0)).members.find(m => m.id === ids[1]).completed_challenges, 1)
await rejects(() => act(0, 'progress', { challenge_id: challenge.id, progress: 0 }), /has ended/)
check((await db.query('SELECT coins FROM public.profiles WHERE id = $1', [ids[0]])).rows[0].coins, 42)

await act(2, 'create', { name: 'Other Party' })
await rejects(() => act(2, 'participate', { challenge_id: challenge.id }), /not found in your party/)
check((await asUser(2, () => db.query('SELECT * FROM public.party_challenges'))).rows.length, 0)
check((await asUser(2, () => db.query('SELECT * FROM public.party_challenge_progress'))).rows.length, 0)

const tomorrow = new Date(Date.parse(today) + 86400000).toISOString().slice(0, 10)
await act(0, 'create_challenge', { title: 'Tomorrow', target: 2, unit: 'walks', start_date: tomorrow, end_date: tomorrow })
const upcoming = (await state(0)).challenges.find(c => c.title === 'Tomorrow')
check(upcoming.status, 'upcoming')
await rejects(() => act(0, 'progress', { challenge_id: upcoming.id, progress: 1 }), /not started/)
await db.query("UPDATE public.party_challenges SET start_date = CURRENT_DATE - 2, end_date = CURRENT_DATE - 1 WHERE id = $1", [upcoming.id])
check((await state(0)).challenges.find(c => c.id === upcoming.id).status, 'expired')
await rejects(() => act(0, 'participate', { challenge_id: upcoming.id }), /has ended/)

for (let i = 3; i < 9; i++) await act(i, 'join', { code })
check((await state(0)).members.length, 8)
await rejects(() => act(9, 'join', { code }), /full/)
await act(1, 'leave')
check((await state(1)).party, null)
check((await asUser(1, () => db.query('SELECT * FROM public.party_challenge_progress'))).rows.length, 0)
await act(1, 'join', { code })
check((await state(1)).challenges.find(c => c.id === challenge.id).participants.find(p => p.user_id === ids[1]).progress, 10)
await act(2, 'leave')
check((await state(2)).party, null)
check((await db.query('SELECT count(*)::integer AS n FROM public.parties')).rows[0].n, 1)
console.log(`PASS: ${checks} PostgreSQL checks (membership, capacity, persistence, completion, expiry, RLS, impersonation, unchanged coins).`)
await db.close()
