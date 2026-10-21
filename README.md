# LEX ACTIVE

Mobile-first React + TypeScript fitness app with Vite and Tailwind. Five tabs, persistent device logging, optional cloud accounts and internal-only social features. No fabricated activity, social login or external social sharing.

## Run

Use Node 24 and npm:

```sh
npm ci
npm run dev
```

Without public Supabase environment variables the app runs in device-only mode. Existing browser records retain their original storage key. Cloud accounts have separate storage; importing device records is explicit and preserves the originals. Do not clear browser storage to update the app.

## Implemented

Quick independent exercise logging, optional saved exercise groups and workouts, persistent drafts/history, manual dated nutrition and correct shared daily totals, real-data charts, themes, rest timer, plate calculator and estimated one-rep max. Groups can have optional labels; logging never requires categories.

Configured accounts support email authentication, profiles, offline queued sync, revision conflicts, explicit device-data import, account export and confirmed deletion. Internal social workflows include username search, friend requests, blocking, permissions, feed posts/reactions/comments, notifications, messages and Workout Exchange with actual returned results. These require the database migrations and deployed functions; an unconfigured site never pretends they are active.

This is an implementation milestone, not completion of the full master specification. Programmes, richer set metadata/history editing, food databases/recipes/barcodes, comprehensive cardio/body/wellness workflows, photo gallery, reports, challenges and rankings still need work. Schema alone does not count as a completed feature.

## Backend and deployment

[Deployment instructions](docs/DEPLOYMENT.md) cover the supplied hosted Supabase project, migrations, server functions, auth redirects and GitHub Actions variables. No connection form exists inside the app. Never place a service-role key in frontend configuration.

```sh
npm run backend:local
npm run backend:migrate:local
npm run backend:functions:local
# Keep functions running in a separate terminal, then:
npm run test:backend
npm run test:cloud
```

The compact local stack runs actual Supabase Auth, Storage and PostgREST with PostgreSQL. Realtime and native Deno startup require hosted verification. Local credentials are generated in ignored files. Hosted migrations have not been applied by this workspace.

```sh
npm test
npm run build
npm run test:e2e
```

Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` where Chromium is already installed, or install Playwright Chromium. Tests use iPhone-sized Chromium, not physical Safari. After cloud tests, rebuild with deployment configuration before publishing.

Pushes to `main` deploy through GitHub Actions to https://abbasfazli725-web.github.io/lex-active/. Confirm the deployment workflow succeeds. The workflow sets the repository asset base path and reads the public Supabase repository variables. Device-only mode remains available when neither variable is configured.

## Product and implementation records

- [Complete master specification](docs/PRODUCT_SPEC.md)
- [Requirement checklist and honest completion status](docs/FEATURE_CHECKLIST.md)
- [Architecture and persistence](docs/ARCHITECTURE.md)
- [Database migrations and security](docs/DATABASE.md)
- [Deployment and hosted setup](docs/DEPLOYMENT.md)
- [Continuation instructions](docs/CONTINUE_DEVELOPMENT.md)

Health records on the device are not application-encrypted. Use a trusted device and export backups. Cloud access is enforced by database policies and authenticated server functions; sharing is explicit and revocable. Native iPhone testing and further security/accessibility review remain necessary before a broad public launch.
