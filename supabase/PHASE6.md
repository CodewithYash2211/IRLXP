# Party and challenges

`phase6.sql` is an additive, transactional upgrade for existing IRLXP databases.
Apply it once after the original `schema.sql`. Do not rerun the original schema
against an existing database. The repository previously used standalone SQL
files and does not have an established migration history.

The upgrade adds `parties`, `party_memberships`, `party_challenges`, and
`party_challenge_progress`. The legacy `party_members` friend-request table is
unchanged. `get_party_state` and `party_action` use the authenticated session.
Privileged implementations live in the non-exposed `irlxp_private` schema with
an empty search path and restricted execution grants. Public wrappers are
security invoker functions. All four tables have RLS and read-only grants;
validated functions perform writes atomically. Profile reads expose only
member names, IDs, XP, and completed personal-target counts.

Rules:
- One party per player; eight players maximum. Share the generated party code.
- Any member may create a challenge. The creator is enrolled automatically.
- Targets are cumulative totals per participant, not daily resets.
- Dates are UTC, end date inclusive; maximum duration is 365 days.
- Upcoming challenges allow enrollment, but progress starts on the start date.
- Progress can be corrected while active. Everyone enrolled must reach the
  target to mark the challenge completed. Completed challenges are locked.
- Expired status is derived from the stored end date on the server at read and
  write time; no scheduled background job is required.
- Leaving retains progress and history while other members remain. A departed
  participant is shown as “Former member”; rejoining restores their progress.
  The last member leaving removes the party and its challenge history.
- Challenges do not award XP or coins. The leaderboard reuses existing profile
  XP and `lib/game/progression.ts` for levels.
- Challenge edits/deletions and party ownership roles are intentionally absent.

Apply through the authenticated CLI:
`supabase db query --linked --file supabase/phase6.sql`

Run the live integration test (fixtures are rolled back):
`supabase db query --linked --file supabase/test-phase6.sql`

Run isolated PostgreSQL coverage using PGlite 0.3.14 installed outside the app:
`node scripts/test-party.mjs <absolute-path-to-pglite/dist/index.js>`

The runtime is only for tests; no application dependency is added.

## Implementation inventory

Created:
- `app/(game)/party/PartyScreen.tsx` — forms, member list, progress, history, feedback.
- `app/(game)/party/loading.tsx` — route loading state.
- `app/api/party/route.ts` — authenticated, same-origin mutation endpoint.
- `lib/validation/party.ts` — whitelisted request validation.
- `types/party.ts` — party state and challenge types.
- `supabase/phase6.sql` — additive database upgrade.
- `supabase/test-phase6.sql` — rollback-only live integration test.
- `scripts/test-party.mjs` — isolated PostgreSQL tests.
- `scripts/test-party-validation.mjs` — input validation tests.
- `supabase/PHASE6.md` — this implementation and verification record.

Modified: `app/(game)/party/page.tsx` (authenticated data loading) and
`supabase/schema.sql` (one comment pointing to the additive upgrade).
Existing uncommitted Phase 4 edits were preserved.

## Verification — 2026-09-13

- Upgrade applied successfully to the linked Supabase project.
- 41 isolated PostgreSQL assertions passed, including invalid/duplicate joins,
  capacity, outsider reads/writes, spoofed user IDs, progress bounds, completion,
  expiry, upcoming challenges, leave/rejoin, and unchanged coins.
- 16 input-validation assertions passed (`node scripts/test-party-validation.mjs`).
- Live database integration passed with authenticated test contexts; all fixture
  accounts, memberships, and challenges were rolled back.
- Signed-in browser checks passed: invalid code, create party, view members,
  create challenge, participate in another member's challenge, save progress,
  full reload persistence, completed history, leave, rejoin, restored history.
- Desktop (1280 px), mobile (390 px), and narrow challenge form (320 px) checked;
  no horizontal document overflow. Desktop and mobile visually inspected.
- Browser QA party/challenges and temporary test member removed afterward.
- `npm run lint` passed with two pre-existing unused-import warnings in
  `lib/validation/quest.ts`.
- `npm run build` passed outside the sandbox (sandbox worker spawning caused
  `EPERM`); existing middleware deprecation warning remains.
- Supabase security advisor reported no warnings on Phase 6 objects. Existing
  warnings remain for legacy function search paths, legacy definer function
  execution grants, and disabled leaked-password protection. These were outside
  the Phase 6 change scope.

No known Phase 6 blocker remains. Multi-session race stress testing was not run;
database row/advisory locks and uniqueness constraints protect those operations.
