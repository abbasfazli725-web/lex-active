# Database and security

## Migration order

Apply every file in `supabase/migrations/` in filename order. All are version-controlled and tested on the compact local PostgreSQL 16/Supabase stack. Hosted Supabase has not been migrated by this task.

1. [202610210001_foundation.sql](../supabase/migrations/202610210001_foundation.sql): profiles, preferences, owner-scoped normalised health/training/nutrition tables, friend consent, granular grants and revocation triggers.
2. [202610210002_sync.sql](../supabase/migrations/202610210002_sync.sql): revision catalog, idempotent transactional writes and account-identity guards.
3. [202610210003_social_and_storage.sql](../supabase/migrations/202610210003_social_and_storage.sql): participant-scoped messaging, feeds/reactions/comments, asynchronous exchanges, challenges schema and private buckets.
4. [202610210004_access_refinements.sql](../supabase/migrations/202610210004_access_refinements.sql): conversation insert/RETURNING policy and challenge discovery correction found by real RLS tests.
5. [202610210005_notifications.sql](../supabase/migrations/202610210005_notifications.sql): generic in-app notifications, relationship revocation and conditional hosted Realtime publication registration.
6. [202610210006_account_export.sql](../supabase/migrations/202610210006_account_export.sql): owner-scoped export and owned avatar paths.
7. [202610210007_export_and_blocks.sql](../supabase/migrations/202610210007_export_and_blocks.sql): additional export coverage and private blocked-person labels.
8. [202610210008_private_media.sql](../supabase/migrations/202610210008_private_media.sql): per-request private-photo authorisation and prevention of friend-issued signed links.

Do not deploy just the first migration. Do not edit applied files; add a new migration. `npm run backend:migrate:local` maintains a transactional, checksum-checked **local-only** ledger. Hosted Supabase CLI uses its own migration ledger.

## Ownership and normalisation

Training sessions → exercise performances → sets use `(owner_id, id)` composite keys and owner-scoped foreign keys. Routines and nutrition/recipe/programme structures are separate tables. This prevents a child's owner from pointing into another account's parent. Source records are private by default.

Profiles contain no height, weight, calorie diaries or health fields. Optional category grants permit only that category; a nutrition-summary grant never permits a full food diary. Friends cannot see private measurements without an explicit relevant grant. Partner/close-friend designation itself adds no grants.

Some schema tables are foundations for future workflows. Their presence is not a completion claim; consult the checklist.

## Synced records

`sync_versions` supplies revisions and tombstones; `sync_operations` deduplicates retries. `sync_write` requires an expected account, expected revision and operation UUID. Normalised tables are updated in the same transaction. Core synced aggregates are not directly writable by the browser role; RPCs derive ownership from the verified JWT.

`sync_catalog` returns only the caller's records, reconstructed from normalised tables. Conflicts return the current version rather than overwrite it. Draft payloads are size-bounded and restricted to supported fields. The client validates reconstructed state before replacing local records.

## Social security

Accepted friendships are created by the recipient's response RPC. Request senders/recipients are not editable via direct update APIs. Message sender IDs must match the authenticated identity. Exchange invitations snapshot an owned routine; results snapshot a workout owned by the recipient. Comparisons contain no body metrics or body-weight-derived ratios.

Blocking immediately removes friendships and grants, cancels pending requests, revokes relationships and causes subsequent feed/message/exchange/photo checks to fail. Friendship removal also deletes grants so re-adding somebody does not silently restore sensitive access.

## Storage and functions

- `avatars`: private bucket; owned upload paths and authenticated, unblocked profile-image access.
- `progress-photos`: private bucket; owner-only direct reads. Shared reads use `private-media`, which verifies the caller and current category grant on **every request** and sends `Cache-Control: no-store`.
- Upload paths start with the owning user's UUID. Upload limits and permitted MIME types are constrained in the bucket configuration. Existing buckets are not overwritten blindly.
- `delete-account` verifies a real user JWT and explicit `DELETE` confirmation, removes owned storage files, then deletes the Auth identity and cascades owned rows. The request cannot choose another account's ID.

The JSON export contains account records and image metadata, not binary image files, Auth passwords, service keys or access tokens. A full photo archive/restore interface remains unfinished.

## Tests

`npm run test:backend` creates unique local test identities and exercises real Auth/PostgREST/Storage/RPCs. It tests case-insensitive usernames, identity spoofing, source ownership, friend consent, granular grants, chat/exchange access, file access, blocks, export and deletion. It cleans up only identities it created. It never targets the hosted project.

The compact local stack has no hosted Realtime WebSocket service. Hosted publication and delivery behaviour, hosted email delivery and physical-device Safari must still be checked after configuration. A local pass is not a claim of hosted deployment.
