PROJECT: IRLXP
Tagline: LEVEL UP YOUR REAL LIFE.

STACK:
Next.js + React + TypeScript
Tailwind CSS
Framer Motion
Supabase PostgreSQL + Auth
Lucide React

CURRENT ROADMAP:
1. Foundation + visual shell        ✅
2. Auth + database                  ✅
3. Quest engine                     ✅
4. XP / Level / Stats / Streak/Gold 🚧 CURRENT
5. Avatar + Shop                    👥 FRIEND WORKING
6. Party / Challenges               ⏳
7. Polish + animation + responsive  ⏳
8. Deploy + test + video            ⏳

GIT:
Remote:
https://github.com/CodewithYash2211/IRLXP.git

Stable branch:
master

Current stable checkpoint:
1ade1e3
"chore: checkpoint phase 3 completion"

Your branch:
phase4-progression

Friend's branch:
phase5-avatar-shop

IMPORTANT:
Do not directly work on master.
Do not reset/revert existing work.
Keep Phase 4 and Phase 5 changes isolated.

CURRENT WORKING FEATURES:
- Supabase project connected
- Auth working
- Email/password login working
- Protected game routes working
- Quest create/list/edit/delete working
- Quest completion working end-to-end
- complete_quest RPC working
- XP/coins/stat/streak result is returned by completion flow
- Completed quest history working

RECENT CRITICAL FIX:
Supabase URL in .env.local had a typo.
Correct project URL is:
https://skxmembxyqapyvlinpkg.supabase.co

Never expose .env.local or secrets.

PHASE 3 VERIFICATION:
Successful completion response previously included:
xpEarned: 20
coinsEarned: 10
attributeAffected: intellect
attrGain: 5
levelBefore: 1
levelAfter: 1
leveledUp: false
newStreak: 1

PHASE 4 GOAL:
Implement/verify:
- XP display/progression
- level calculation/progress
- intellect/strength/discipline/vitality
- streak
- coins/gold
- reward feedback
- profile/game UI synchronization

Use existing server-authoritative RPC and existing:
lib/game/progression.ts
lib/game/rewards.ts
lib/game/streaks.ts

Do not duplicate reward/progression formulas.

PHASE 5 FRIEND:
Friend is implementing:
- avatar
- character screen
- shop
- inventory
- purchase
- equip
- cosmetics

Existing DB/RPC concepts:
- profiles
- items
- inventory
- purchase_item
- equip_item

Do not implement Phase 6/7 yet.

UNTRACKED LOCAL DEBUG FILES AT LAST CHECK:
supabase/.temp/
supabase/rpcs.sql
test-completion.ts
test-quest.ts

These were NOT committed.

IMPORTANT DESIGN DIRECTION:
Pixel Adventure × Modern UI.
The product should feel like an actual game, not a generic SaaS dashboard.
Phase 7 is where the major game-world visual transformation/animations happen.

NEXT IMMEDIATE TASK:
Continue Phase 4 from the current phase4-progression branch.
First audit existing progression/reward/streak code.
Then implement only Phase 4.
Test end-to-end.
Run:
npm run lint
npm run build
Do not start Phase 5/6/7.