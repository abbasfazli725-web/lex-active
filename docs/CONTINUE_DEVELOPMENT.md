# Continue LEX ACTIVE development

## Start here

Use the existing `/workspace/lex-active` checkout. Do not restart or reset the project and do not create a worktree unless the owner asks. Read `PRODUCT_SPEC.md`, `FEATURE_CHECKLIST.md`, `ARCHITECTURE.md`, `DATABASE.md`, `DEPLOYMENT.md` and any applicable AGENTS instructions. Preserve existing user changes and version-1 browser data.

`454109a` is the original working app and remains in history. `e139fb7` is the exercise-first/nutrition release. Current work extends those implementations rather than replacing them. Verify remote `main` before claiming publication.

## What this session built

- Build-time Supabase configuration, lazy SDK loading, real Auth/session/profile flows.
- Project/account-isolated local storage, explicit guest import, IndexedDB outbox, transactional revisions, retry deduplication, tombstones, conflict UI and concurrent-tab safeguards.
- Normalised migrations spanning the complete product's main entities, with tested private defaults and participant access.
- Actual friend requests, search, remove/block/unblock, feed publication/reactions/comments, messages, notifications, asynchronous exchange snapshots, results, relationships and granular grants.
- Private Storage policies and a per-request shared-photo gateway; account export/deletion handlers.
- Rest timer, plate calculator, 1RM estimates and optional routine labels without changing exercise-first logging.
- Automated local multi-identity HTTP/RLS/Storage tests and real browser workflows.

This is substantial functional work, **not** completion of the entire master specification. Tables for future features are not finished workflows.

## External prerequisites still outstanding

The hosted project URL was supplied in chat. Its public key must be configured in environment settings and GitHub Actions variables. No migration-admin or function-deployment authorisation was supplied. The hosted database/functions have not been applied/verified by this session. The environment draft includes the hosted domain and public-variable requirements; saving that draft does not apply runtime configuration or publish a snapshot.

Follow `DEPLOYMENT.md` exactly. Never ask for database passwords or service-role keys in chat or frontend variables. Never claim hosted Auth/Realtime/email/security passed based on local tests.

## Next implementation tasks

1. Complete hosted configuration and run the multi-account verification checklist. Verify Deno Edge functions and real email verification/recovery, and confirm hosted Realtime delivery with RLS. Fix any compatibility errors before release claims.
2. Complete training: richer exercise catalogue/equipment/muscles, favourites, substitutions, RIR/RPE/set types/unilateral/timed/assisted sets, notes, session timing/pause/resume, completed-workout editing, automatic rest options, transparent progression and programmes. Extend model + queue encoding + normalised RPCs together; do not silently drop new metadata during sync.
3. Complete nutrition: reliable attributed food APIs, missing-value handling, fibre, serving conversions, custom foods, saved meals/recipes/scaling, meal copying, manual targets, deterministic text matching and meal planning. Check current API terms/rate limits before connecting a source; no invented food data.
4. Add real cardio/water/body/sleep/wellness/photo editors and synced record kinds. Use private defaults. A photo schema/gateway is not yet a full progress-photo gallery. Do not cache private API responses in the app-shell service worker.
5. Finish social UX: full friend profiles/photo uploads, notification preferences, relationship request decline/details, privacy-controlled shared-data viewers, pagination, exchange reactions/one-tap rematches, challenges and friends-only leaderboards. Existing rematch UI saves a new group; it does not automatically send a rematch. Existing comparisons distinguish routine targets from returned actual sets.
6. Implement defensible, versioned strength tiers using exactly Iron, Bronze, Silver, Gold, Platinum, Diamond, Iridium, Ascendant, Mythic, Celestial. No invented percentiles or attendance-based strength ranks. No arbitrary body-weight/height exposure.
7. Build scheduled programmes, intelligence, complete analytics/reports/Strength Passport/Annual Wrapped and final accessibility/performance/device/security review. Missing days are not zero; estimates need explicit limits.

Keep feature status per layer accurate. Add migrations rather than editing applied files. Preserve photos/health privacy after friendship removal and block, including revocable media requests; do not introduce long-lived signed links for shared sensitive files.

## Reproduce tests

See commands in `DEPLOYMENT.md`. Local services use `supabase/local/compose.yml` and generated ignored `supabase/.local.env`. Keep the local-functions process running for backend/browser deletion/photo tests. Cloud browser tests only target the local stack and create distinct test identities; they never target the hosted owner account. The standard local CLI image failed on disk usage; the compact stack is the working path.

Always finish with a deployment build using intended public configuration, not the local test URL/key. Run relevant tests, production build, dependency audit and `git diff --check`; commit, push and verify the remote. Update completion tracking, blockers and exact next steps. No fake production readiness, no secret values in logs, no external social integration.

## Validated release evidence

- 24 unit tests passed.
- 12 real local backend tests passed, including cross-user RLS, idempotence, revocation, private media, export and deletion.
- Three real local-cloud browser workflows passed: account isolation/import/offline/multiple devices; friends/messages/notifications/exchange; account export/deletion.
- Production device-only build passed; 11 device browser regressions passed (the three cloud cases were separately run against the local backend). Hosted setup, Deno Edge runtime, Realtime, email callbacks and physical iPhone Safari remain outside that evidence.
- Dependency audit reported zero vulnerabilities at validation time.
