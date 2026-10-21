# Architecture

LEX ACTIVE is an existing React/TypeScript/Vite/Tailwind PWA. The application is not being restarted. Exactly five primary tabs remain. Quick exercise logging is independent of optional full workouts and saved routines. Training labels are optional progressive disclosure under the latest master specification.

## Frontend boundaries

- `src/model.ts`: backwards-compatible version-1 device records, validation, calculations and scoped persistence. The original `lex-active:v1` key is unchanged.
- `src/TrainingEditor.tsx`, `QuickExercise.tsx`, `FoodEditor.tsx`: actual logging and editable routine forms.
- `src/TrainingTools.tsx`: wall-clock rest timer, plate calculation and explicitly estimated 1RM.
- `src/ProgressChart.tsx`: lazy-loaded charts from actual logged days; missing days are omitted.
- `src/backend/client.ts`: validates build-time public configuration and lazily loads Supabase. Rejects service-role/secret keys in public fields. No runtime connection form.
- `Auth.tsx`: real Auth session lifecycle and identity-specific app remounting. No guest-health-data flash while restoring an account session.
- `AccountPanel.tsx`: email registration/login/recovery, profile updates, sign-out, cloud JSON export and confirmed account deletion.
- `records.ts`: aggregate encoding, state validation, explicit guest import and concurrent-tab merge rules.
- `sync.ts`: IndexedDB outbox, revision tracking, idempotent operations, conflict resolution and recovery copies.
- `useCloudSync.ts`: lifecycle, reconnection, debouncing and bounded automatic refresh.
- `Social.tsx`, `Notifications.tsx`: actual friend/feed/message/exchange/permission APIs. Unconfigured deployments explain the dependency rather than inventing activity.

## Data separation

The existing anonymous device store stays untouched when a user signs in. An account uses a separate key containing its project hostname and authenticated user ID, and a similarly scoped IndexedDB database. Signing out unmounts account UI and restores the anonymous store. An explicit import action merges device records by ID, keeps existing account versions and leaves the original device store intact.

Cloud-bound records remain readable from scoped local storage if the IndexedDB queue is unavailable. A failed queue or network operation is visible; it does not make a successful device save into a claimed cloud save. Local browser storage is not application-encrypted and requires a trusted device. Auth tokens are managed by Supabase and are not included in application exports.

## Sync contract

The queue stores one desired operation per aggregate (workout, routine, food entry, theme preferences, or unfinished drafts). Committed workouts/routines/sets/foods are stored in normalised PostgreSQL tables, not one account-sized JSON row. Drafts use an appropriate bounded aggregate JSON record.

1. Persist the device record first.
2. Diff records against the last captured local snapshot; reconstruct a missed queue entry after a crash.
3. Send the expected server revision and a stable operation UUID.
4. The server serialises writes to the record, checks the expected account against `auth.uid()`, applies a transaction and records an idempotent acknowledgement.
5. Remove only the acknowledged operation. A newer operation from another tab is retained/rebased.
6. Pull remote records, retaining pending or locally changed versions. Ignore stale cloud revisions.
7. Use tombstones to prevent stale devices resurrecting deleted records.
8. On conflict, preserve both values and require an explicit choice. Retain the unchosen device operation in the local recovery archive.

No automatic guest upload and no silent last-write-wins policy. Identity checks are repeated in RPCs so a session change while a request is in flight cannot upload account A's records into account B.

## Backend and privacy

Supabase Auth owns identities. `profiles` contains searchable social fields only. Private source tables use RLS and owner-scoped composite foreign keys. Sharing grants are category-specific and require a current accepted friendship. Blocking and friendship removal revoke grants; relationship acceptance grants no private data automatically.

Friend feeds contain explicit, sanitised workout snapshots, not access to private diaries. Conversations/exchanges require authorised participants and current unblocked friendship. Messages and exchange results cannot be impersonated or supplied from another user's private workout.

Both Storage buckets are private. A private-photo gateway validates the user and current permissions on every shared-photo request. Friends cannot mint long-lived signed links to bypass later revocation. Already downloaded files cannot physically be recalled; the gateway controls subsequent access.

Account deletion and private-media handlers keep service-role access exclusively in server functions. Their HTTP handlers are exercised locally against actual Auth/Storage; the Deno entrypoints still require hosted deployment and verification. Hosted Realtime is supported for message refresh with polling fallback; a local WebSocket Realtime service is not part of the compact stack.

## Deployment distinction

GitHub Pages hosts only the built static PWA. Supabase hosts Auth/database/storage/functions. Vite public variables are compiled into the frontend at build time. Changing a GitHub variable requires another build. A client deployment does not apply a SQL migration or deploy a function.

## Remaining architecture work

Extend the typed domain model and sync RPCs together before introducing new offline record types. Schema support alone does not implement nutrition search, recipes, programmes, ranks, cardio or wellness workflows. Do not expose a new editor whose fields would be dropped by the current sync encoder. Full requirements and per-layer status live in `PRODUCT_SPEC.md` and `FEATURE_CHECKLIST.md`.
