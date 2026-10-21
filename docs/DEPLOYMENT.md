# Deployment: existing GitHub Pages app + hosted Supabase

No real public key, database password, access token or service-role key is committed. There is no in-app connection form. Use Vite environment variables and repository Actions variables. The project owner already supplied the hosted project URL in chat; keep connection values in settings.

## 1. Apply the database migrations

Recommended, using an authorised local terminal with Node and the Supabase CLI:

```sh
npx supabase login
npx supabase link --project-ref izkrdcnfuhoamffjimcg
npx supabase db push --dry-run
npx supabase db push
```

Use the project reference from the hostname before `.supabase.co`. Review the dry-run: it should list the eight migrations in this repository. Supply the database password through the CLI's secure prompt, never through chat, a committed file or a frontend variable. Do not reset the hosted database. If the project already has application tables, review conflicts before applying anything.

**Dashboard alternative for a new, empty project:** open Supabase Dashboard → your project → SQL Editor → New query. Paste each migration file in filename order and run it once, through `202610210008_private_media.sql`. The files are linked in `DATABASE.md`. These are real SQL migrations, not seed data. If a query fails, stop and report the exact error instead of skipping it. Do not enable the new client until all migrations succeed.

SQL Editor does not update the CLI migration ledger. Before later using `db push`, use `supabase migration repair --status applied VERSION` for each migration version already applied through SQL Editor, after verifying the schema. Do not blindly rerun CREATE statements. The supplied CLI path maintains the ledger automatically and is preferred for ongoing development.

## 2. Deploy server functions

```sh
npx supabase secrets set APP_ORIGIN=https://abbasfazli725-web.github.io --project-ref izkrdcnfuhoamffjimcg
npx supabase functions deploy delete-account --project-ref izkrdcnfuhoamffjimcg
npx supabase functions deploy private-media --project-ref izkrdcnfuhoamffjimcg
```

The checked-in `supabase/config.toml` supplies the import map and entrypoints. Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to these server functions; never put the service-role value into a `VITE_` variable. JWT verification stays enabled, and each handler independently verifies the caller. The local Node adapter tests the same handler logic; hosted Edge execution must be verified after deployment.

## 3. Configure Auth redirects and email

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://abbasfazli725-web.github.io/lex-active/`
- Redirect URLs: add exactly `https://abbasfazli725-web.github.io/lex-active/`
- For local development also allow `http://127.0.0.1:5173/**` and the local test URL `http://127.0.0.1:5177/**`.

Registration and password recovery return to the app root with the Supabase callback parameters, avoiding GitHub Pages route 404s. Keep email verification enabled for the hosted project. Check Supabase's current email delivery restrictions before inviting users outside the project team; SMTP setup may be required. Do not introduce a paid provider without the owner's approval. Local Mailpit catches test emails and does not send them externally.

## 4. Configure GitHub Actions build variables

In `abbasfazli725-web/lex-active`:

1. **Settings → Secrets and variables → Actions → Variables**.
2. Choose **New repository variable**.
3. Add `VITE_SUPABASE_URL` with `https://izkrdcnfuhoamffjimcg.supabase.co`.
4. Add `VITE_SUPABASE_PUBLISHABLE_KEY` with the **publishable** key from Supabase's project API keys settings. A legacy public `anon` key is supported. Do not use `service_role`, `sb_secret_`, a database password or a personal access token.
5. **Settings → Pages → Source → GitHub Actions**, where possible. The deploy workflow also waits for competing legacy/Jekyll jobs before publishing the compiled app. The optional Jekyll workflow is manual-only.
6. **Actions → Deploy LEX ACTIVE to GitHub Pages → Run workflow → main**.

The workflow already maps both variables into `npm run build` and sets `VITE_BASE_PATH=/lex-active/`. Vite variables are public frontend configuration, not hidden backend credentials. Adding them without rerunning the build does not update the deployed bundle.

If neither variable is set, the build remains usable in device-only mode and states that cloud accounts are not configured. If only one variable is set, prebuild fails explicitly so incomplete cloud configuration is not silently deployed.

## 5. Verify the hosted release

Open the Pages URL after Actions succeeds. Close old app tabs or use **Update app** when offered; do not clear browser data.

1. Export the existing device training/food JSON backup.
2. Register and verify an email; sign in. The account initially has its own records, separate from device-only entries.
3. In Account, explicitly choose **Import device records into account**. Original device records remain untouched.
4. Confirm cloud status, then sign in from a second device and verify actual records.
5. Log offline, reopen, reconnect and verify one cloud copy.
6. Test a friend request, message and exchange with a second real account.
7. Verify stranger denial, permission revocation and private-photo gateway access with distinct identities.
8. Test recovery email and deletion with dedicated test accounts, never the owner's only account.

Do not call the hosted backend verified until these succeed. This workspace cannot presently verify the hosted project: no publishable key or authorised migration/deployment session is supplied, and hosted egress requires the saved domain allowance to be applied.

## Local development and tests

```sh
npm ci
npm run backend:local
npm run backend:migrate:local
npm run backend:functions:local
# Keep the functions process running in a separate terminal.
npm run test:backend
npm run test:cloud
```

The compact local stack uses PostgreSQL 16 and actual Supabase Auth, Storage and PostgREST services, with local Mailpit. It substitutes a local-only nginx gateway and omits hosted Realtime. This is intentional: the standard CLI PostgreSQL image exceeded the Docker VFS disk budget here. Local roles/bootstrap scripts are **not** hosted migrations.

`supabase/.local.env` is generated with local-only credentials and ignored by Git. No keys are printed. `test:cloud` supplies only the generated **public anon** key to the test build and uses the real services; it does not mock authentication. Account-deletion/private-media handlers run through the local adapter. Native Deno Edge startup is not claimed to have been tested by that adapter.

To run the app interactively, copy `.env.example` to `.env.local` and supply the public URL/key for the chosen environment. For the compact local stack use the generated local anon key, not its service-role value. Do not commit `.env.local`. Then run `npm run dev`.

```sh
npm test
npm run test:e2e
VITE_BASE_PATH=/lex-active/ npm run build
npm audit
```

For this workspace's installed browser, prefix browser commands with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`. Else install Playwright's Chromium. Browser checks are Chromium at iPhone dimensions, not physical iPhone Safari certification. A normal build after `test:cloud` must use the real deployment variables or no variables; never publish the local test bundle.
