# LEX ACTIVE

A mobile-first, local-first fitness application built with React, TypeScript, Vite and Tailwind CSS. No paid services, fabricated activity, social login or external social integrations.

## Run

Requires Node.js 22.12+ (validated on Node 24) and npm.

```sh
npm ci
npm run dev
```

The server listens on port 5173 and all interfaces. For an iPhone on the same local network, open your computer's LAN IP on port 5173 in Safari. A cloud workspace needs its provider's authenticated port forwarding, or deployment to a static HTTPS host. No public deployment is provisioned by this repository.

```sh
npm run build
npm run preview
npm test
npx playwright install chromium
npm run test:e2e
```

On machines with an existing Chromium installation, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Browser tests use iPhone 13 dimensions and touch emulation with Chromium; this is not a real Safari certification.

## First milestone

- Exactly five navigation destinations: Home, Train, Nutrition, Progress, Social.
- Blush, Classic, Midnight and device-following appearance, saved between visits.
- Empty or routine-based workouts, exercise search/custom names, sets, repetitions, kg, completion marks, duplicate-last-value sets, set/exercise removal and interrupted-session recovery.
- Optional saved exercise groups (routines), created and edited directly, with bulk exercise selection, set targets, duplication and deletion. No category setup. Existing category metadata is preserved for backup compatibility.
- Completed workout history, detail and confirmed deletion; only completed sets enter history and statistics.
- Manual dated nutrition diary with explicit portion totals for calories/protein/carbohydrate/fat, daily totals, editing and confirmed deletion. Home and the diary share one dated calculation, refresh changes across tabs and follow local-day changes. No food values are inferred.
- Lazy-loaded interactive volume, heaviest-set and calorie charts, date ranges, accessible data table and personal bests from actual records. Missing days are omitted, not treated as zero. Nutrition totals do not imply a complete day.
- Versioned local storage, schema checks, explicit save failures, conflicting-tab write protection and private JSON export.
- Installable manifest and offline application-shell cache for production builds. On an HTTPS deployment, open once online, then Safari → Add to Home Screen. App updates wait for old tabs to close. Offline cache does not upload or synchronise health data.

## Privacy and limitations

All entries remain in this browser's local storage, without application-level encryption. Use a trusted personal device. Clearing site storage, private browsing or changing origin can remove/hide records. Export backups in Settings regularly; JSON import is not implemented. No server receives workout or food records. No analytics, third-party fonts, trackers or external APIs are used.

Social, notification inbox and relationship interfaces are labelled previews. No accounts, usernames, friendships, messaging, sharing, rankings or permissions are claimed to work. Future social interactions, summaries, reports and Workout Exchange must stay inside LEX ACTIVE and its own backend; never add external posting or social login. Sensitive information must remain private unless explicitly permitted, with access enforced in the backend.

Not yet implemented: Supabase accounts/cloud sync/RLS, IndexedDB sync queue, completed-workout editing, rest timers, RPE/RIR/set types, food search/barcodes/recipes, nutrition goals, body/cardio logging, reports, ranking engine and production hosting. There are no fake controls for these features.

Next milestone: richer workout editing/history and rest timers, followed by Supabase email authentication, owner-only RLS and tested idempotent sync before any social functionality. Native Safari/iPhone testing, accessibility review and security review are required before a public release.

## Deploy a private iPhone preview

Build with `npm ci && npm run build`, deploy `dist/` to an HTTPS static host (for example Cloudflare Pages: build command `npm run build`, output directory `dist`), and open the resulting URL in Safari. No secrets or backend configuration are needed for this local-only milestone. Each origin/device has separate records. A deployed preview URL does not exist yet.

## Project structure

`src/model.ts` contains typed records, validation, calculations and persistence; `src/App.tsx` owns screens and workflows; `src/TrainingEditor.tsx` holds group setup and full-session set controls; `src/QuickExercise.tsx` logs exercises independently; `src/FoodEditor.tsx` handles dated meal forms; `src/ProgressChart.tsx` is loaded on demand; `src/style.css` defines responsive tokens and themes. Unit tests cover calculations and storage. Browser tests exercise real form submissions, reload recovery, routine reuse, charts, nutrition, themes and storage errors.

## GitHub Pages deployment

The included workflow builds and deploys pushes to `main`. In GitHub repository Settings → Pages, set Source to **GitHub Actions**. If the first run failed before enabling Pages, open Actions → Deploy LEX ACTIVE to GitHub Pages → Run workflow. The expected address after a successful deployment is https://abbasfazli725-web.github.io/lex-active/. Check the workflow outcome before assuming the site is live.

The workflow sets `VITE_BASE_PATH=/lex-active/` so assets, manifest and service worker use the repository subpath. Other hosts default to `/`.

## Faster logging release

The primary action is **Log an exercise**: choose a name, enter actual weight/reps, tap **Same again · add set** if needed, then **Save exercise**. No workout session is required. Every save is a separate history record and drives charts immediately. Recent exercises and **Log again** reuse actual prior results, ready to adjust. Unknown exercises start with blank results; nothing is recorded until explicitly saved. Incomplete quick drafts persist, and every tab stays available after closing the editor.

Full workouts and saved exercise groups remain optional. The group builder adds several exercises without reopening a picker, edits set count/reps/weight in place, supports reordering, and saves drafts. You can **Save & start**, or launch a saved group directly from Home. Full-session sets stay on one screen with one-tap completion.

The nutrition fix refreshes data saved in other tabs and resumes today's date after a local-day change. Every food form shows its date; past entries are never silently moved or counted as today's food. Use **Edit** to correct a date or nutrition value. Home's nutrition card always opens today's diary. An update banner lets users activate a newly cached application version without clearing their stored records.

The complete original specification remains the longer-term product scope, except training categories have been removed at the owner's request. Accounts, cloud sync, permission-enforced sharing, friends, messaging, notifications and Workout Exchange still require a configured Supabase project and security-tested backend. This release does not pretend those features are active.
