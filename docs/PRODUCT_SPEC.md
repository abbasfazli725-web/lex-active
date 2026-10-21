# LEX ACTIVE — COMPLETE MASTER PRODUCT SPECIFICATION & DEVELOPMENT DIRECTIVE

## MISSION

Build **LEX ACTIVE**, a premium, comprehensive, mobile-first fitness, nutrition, wellness and social application.

LEX ACTIVE is being created initially for Lex, but it must be designed as a real, scalable application that other users can join.

It should combine the best practical functionality of:

- **Hevy:** Strength tracking, routines, personal records and workout history.
- **Fitbod:** Intelligent training recommendations and progression.
- **MacroFactor:** Accurate nutrition tracking, expenditure estimates and adaptive targets.
- **WHOOP:** Recovery, sleep, readiness and meaningful wellness insights.

LEX ACTIVE must have its own identity, design and features. Do not copy proprietary interfaces, algorithms or branding.

The defining features are its beautiful interface, intelligent fitness tracking, comprehensive progress analytics, personal strength rankings, friends-only social environment and signature **Workout Exchange** system.

**The existing basic application is NOT the finished product.**

The entire specification below is the required product scope. Do not silently remove, simplify or replace requirements with placeholders.

The goal is a fully functioning application, not a mock-up, landing page or minimal prototype.

---

# PART 1 — NON-NEGOTIABLE DEVELOPMENT RULES

1. Work in the existing GitHub repository:
   `https://github.com/abbasfazli725-web/lex-active`
2. Preserve existing functionality and user data.
3. Inspect the repository before making changes.
4. Do not restart the project unless absolutely necessary.
5. Implement real functionality, not decorative buttons or simulated results.
6. All features must be free for users. No subscriptions, advertisements, paid tiers or paywalls.
7. Prefer free-tier infrastructure and free public data sources. Do not introduce paid APIs without permission.
8. Keep all social functionality exclusively inside LEX ACTIVE.
9. Build a genuinely excellent iPhone-first experience that also works on Android, tablets and desktop.
10. Implement all agreed requirements through successive testable development milestones.
11. Do not claim completion until features actually work.
12. Never fabricate workout statistics, nutritional information, social activity, achievements or analytics.
13. Maintain accurate documentation and feature completion tracking.
14. Continue coding rather than stopping after writing a plan.
15. If a session ends, leave the project ready for the next Codex task to continue.

## Explicitly excluded features

Do not implement:

- Global or public leaderboards.
- Instagram, TikTok, Facebook or other external social-media integrations.
- External social-media posting or sharing.
- Live shared workout sessions.
- Exercise tutorial or demonstration video libraries.
- Paid subscription features.
- Rank-gated functionality.
- Automatic sharing of height, body weight, nutrition diaries, progress photos or sensitive measurements with friends.
- Automatic access to all sensitive information for close friends or romantic partners.

---

# PART 2 — DESIGN SYSTEM AND USER EXPERIENCE

## 2.1 Design philosophy

LEX ACTIVE must feel like a premium, polished, modern fitness application.

The interface should be:

- Sophisticated, elegant and visually beautiful.
- Intuitive enough for beginners.
- Powerful enough for experienced gym users.
- Fast and efficient for everyday logging.
- Clean and uncluttered.
- Designed around progressive disclosure: show essential controls first, advanced controls when needed.
- Consistent across every feature.
- Accessible and responsive.

Avoid an overwhelming dashboard filled with unnecessary statistics.

Prioritise meaningful information, clear hierarchy, excellent typography, attractive charts, subtle animations and thoughtful interaction design.

## 2.2 Themes

Implement three complete themes:

**Blush — Default**

A sophisticated soft feminine aesthetic designed especially for Lex.

Use an elegant combination of ivory, soft rose, champagne, warm neutrals and tasteful accents.

Avoid childish, excessively pink or cartoonish styling.

**Classic**

A clean, neutral, minimalist appearance suitable for a broad audience.

**Midnight**

A sophisticated dark theme with excellent contrast and comfortable readability.

Also support following the device's appearance preference.

Theme selection must persist across sessions and synchronise with the user's account.

## 2.3 Main navigation

Use exactly five primary bottom navigation tabs:

1. Home
2. Train
3. Nutrition
4. Progress
5. Social

Provide access to profile, settings, notifications and account controls without overcrowding the main navigation.

## 2.4 Home dashboard

Include:

- Personalised greeting.
- Today's training plan.
- Start workout and Quick Log actions.
- Daily calorie and macro progress.
- Relevant activity and wellness summaries.
- Recent achievements.
- Current strength rank.
- Useful personalised insights.
- Notifications indicator.
- Customisable dashboard sections.

All dashboard information must come from real user data.

Use appropriate empty states for new users.

## 2.5 General interface features

Implement:

- Polished onboarding.
- Helpful empty states.
- Search and filtering.
- Accessible forms.
- Clear loading and error states.
- Confirmation for destructive actions.
- Consistent modals and sheets.
- Useful contextual help.
- Mobile-friendly date and time selection.
- Responsive charts.
- Thoughtful transitions.
- Reliable autosaving.
- Keyboard accessibility.
- Screen-reader support.
- Reduced-motion preferences.
- Metric and imperial unit preferences.

---

# PART 3 — STRENGTH TRAINING

Implement a comprehensive strength training system.

## 3.1 Exercise library

Support:

- Searchable exercise catalogue.
- Muscle-group categorisation.
- Equipment categorisation.
- Exercise variants.
- Primary and secondary muscles.
- Custom exercises.
- Exercise favourites.
- Exercise substitutions.
- Personal exercise notes.
- Exercise-specific history.
- Personal records.
- Training recommendations.

Do not add exercise tutorial or demonstration video libraries.

## 3.2 Workout logging

Implement:

- Start, pause, resume and finish workouts.
- Autosaved active sessions.
- Recovery of interrupted sessions.
- Exercises with multiple sets.
- Weight, reps and duration.
- RIR and RPE.
- Warm-up sets.
- Working sets.
- Drop sets.
- Failure sets.
- Supersets.
- Unilateral exercise logging.
- Bodyweight and assisted exercises.
- Timed exercises.
- Exercise notes.
- Set notes.
- Workout notes.
- Rest timer.
- Automatic rest timer options.
- Exercise reordering.
- Adding and removing sets.
- Duplicate previous sets.
- Previous performance display.
- Plate calculator.
- Session duration.
- Workout volume.
- Estimated one-rep max where appropriate.
- Personal records.
- Completion summaries.

The logging experience must be fast enough to use comfortably between sets at the gym.

## 3.3 Saved routines

Users must be able to create, save, edit, duplicate, delete and launch workout routines.

Organise routines by intuitive training-day categories, including:

- Upper
- Lower
- Push
- Pull
- Legs
- Glutes
- Arms
- Full Body
- Cardio
- Custom

Do not use conventional folder management as the primary organisation method.

Support custom routine categories.

## 3.4 Training programmes

Implement:

- Multi-day training splits.
- Weekly schedules.
- Programme templates.
- Custom programmes.
- Training blocks.
- Programme history.
- Exercise progression.
- Training volume tracking.
- Planned deloads.
- Programme adjustments.
- Plateau identification.
- Recovery-aware recommendations where justified.

## 3.5 Intelligent progression

Use recorded performance to suggest reasonable progression.

Consider:

- Previous sets.
- Repetitions.
- Load.
- RIR/RPE.
- Training consistency.
- Recent progression.
- Plateau patterns.
- User goals.

Clearly explain recommendations.

Avoid presenting unsupported predictions as scientific certainty.

Users must always be able to override suggestions.

---

# PART 4 — NUTRITION

Build a comprehensive nutrition tracking system.

## 4.1 Daily nutrition diary

Track:

- Calories.
- Protein.
- Carbohydrates.
- Fat.
- Fibre.
- Relevant additional nutrients when available.
- Meals and snacks.
- Daily and weekly targets.
- Historical intake.
- Target adherence.

## 4.2 Food database

Integrate reliable free food data sources, prioritising:

- USDA FoodData Central.
- Open Food Facts.

Use each source according to its actual API capabilities, terms, licensing and rate limits.

Support:

- Food search.
- Serving sizes.
- Grams and millilitres.
- Portions.
- Raw versus cooked distinctions.
- Branded foods.
- Custom foods.
- Favourites.
- Recently logged foods.
- Saved meals.
- Barcode scanning when supported.
- Source attribution.
- Clear handling of incomplete nutritional data.

Never invent nutritional values.

Do not treat unreliable crowdsourced entries as unquestionably accurate.

## 4.3 Meals and recipes

Implement:

- Breakfast, lunch, dinner and snacks.
- Custom meal categories.
- Saved meals.
- Recipe creation.
- Ingredient lists.
- Recipe scaling.
- Nutritional totals.
- Recipe serving sizes.
- Meal planning.
- Shopping lists.
- Duplicate previous meals.
- Copy meals between dates.

## 4.4 Smart food logging

Implement natural-language food entry where reliable parsing is possible.

For example, users may enter a food description and quantity.

The system should identify likely matches and request confirmation rather than silently inventing nutritional data.

Do not require paid AI services.

## 4.5 Nutrition goals

Support:

- Maintenance.
- Fat loss.
- Muscle gain.
- Custom goals.
- Adjustable calorie targets.
- Adjustable macro targets.
- Weight trends.
- Estimated energy expenditure.
- Adaptive target suggestions when enough reliable data exists.

Clearly distinguish estimates from measured values.

Do not make unsupported medical claims.

---

# PART 5 — CARDIO AND DAILY ACTIVITY

Support logging for:

- Walking.
- Running.
- Treadmill.
- Incline treadmill walking.
- Cycling.
- Swimming.
- Rowing.
- Stair climber.
- Elliptical.
- Other custom cardio activities.

Record appropriate metrics:

- Duration.
- Distance.
- Pace.
- Speed.
- Incline.
- Resistance.
- Intervals.
- Heart rate when available.
- Estimated calories when defensible.
- Personal records.
- Activity notes.

Include cardio history, charts, progress tracking and selected shareable achievements.

---

# PART 6 — WELLNESS AND BODY TRACKING

Implement optional tracking for:

- Body weight.
- Body measurements.
- Progress photos.
- Sleep duration.
- Sleep quality.
- Water intake.
- Mood.
- Energy.
- Soreness.
- Recovery.
- Readiness.
- Mobility.
- Supplements.
- Optional menstrual-cycle information.

All sensitive data must remain private by default.

Do not require users to provide height, body weight or other sensitive information to use the core app.

Do not expose private metrics through derived values, leaderboards or comparison features.

Support relevant correlations and trends without claiming medical diagnostic capabilities.

---

# PART 7 — STRENGTH RANKING SYSTEM

Implement exactly ten ranks, in this order:

1. Iron
2. Bronze
3. Silver
4. Gold
5. Platinum
6. Diamond
7. Iridium
8. Ascendant
9. Mythic
10. Celestial

## Ranking requirements

Ranks must reflect strength performance, not simply workout attendance.

Implement:

- Individual exercise ranks.
- Overall strength ranking.
- Rank progression.
- Rank history.
- Rank-up celebrations.
- Strength Passport.
- Relevant achievements.
- Friends-only leaderboard comparisons.

Use a documented, defensible ranking methodology.

Do not invent population percentiles or claim statistical accuracy without supporting evidence.

Avoid favouring users merely because they log more workouts.

Handle exercise types and incomplete data carefully.

Ranks must not unlock or restrict application features.

---

# PART 8 — SOCIAL SYSTEM

All social features are strictly within LEX ACTIVE.

## 8.1 Accounts and profiles

Implement:

- User registration.
- Secure login.
- Password reset.
- Email verification.
- Unique usernames.
- Username availability checks.
- Profile pictures.
- Display names.
- Bios.
- Profile settings.
- Privacy settings.
- Account deletion.
- Personal profile.
- Friend profiles.

## 8.2 Friends

Implement:

- Username search.
- Send friend requests.
- Accept friend requests.
- Decline requests.
- Cancel requests.
- Remove friends.
- Block users.
- Appropriate privacy controls.

## 8.3 Activity feed

Provide a friends-only feed with:

- Completed workouts.
- Selected cardio achievements.
- Strength rank achievements.
- Personal records.
- Other explicitly shareable accomplishments.
- Reactions.
- Comments.
- Activity details.

Completed workouts and selected cardio achievements may be friends-visible by default, with an easy private toggle.

Nutrition diaries, body weight, height, body measurements, progress photos and sensitive wellness data must remain private by default.

Do not automatically share sensitive information.

## 8.4 Notifications

Implement an in-app notification inbox for:

- Friend requests.
- Accepted requests.
- Reactions.
- Comments.
- Workout Exchange invitations.
- Returned Workout Exchange results.
- Messages.
- Challenges.
- Relevant achievements.

Include unread counts and read/unread states.

Support notification preferences.

## 8.5 Messaging

Implement secure in-app messaging with appropriate access controls.

Support conversations relevant to friendships, workouts and Workout Exchange.

Do not integrate external messaging platforms.

## 8.6 Challenges

Implement friends-only challenges with clear rules, time periods and progress tracking.

Avoid challenges that incentivise unsafe training or unhealthy nutritional behaviour.

## 8.7 Leaderboards

Leaderboards must be **friends-only**.

Accepted friends appear in eligible friends' leaderboards by default, with a clear opt-out.

Do not create global or public leaderboards.

Do not reveal body weight or height, directly or indirectly, through leaderboard calculations.

---

# PART 9 — WORKOUT EXCHANGE

Workout Exchange is one of LEX ACTIVE's signature features.

Implement it as a complete, functional system.

## 9.1 Sending workouts

A user can:

- Select an existing routine.
- Create a workout for exchange.
- Send it to an accepted friend.
- Include a personal message.
- View pending and completed exchanges.

## 9.2 Receiving workouts

The recipient can:

- Receive an in-app notification.
- Review the routine.
- Accept the exchange.
- Save the routine.
- Complete the workout independently.
- Log their own weights, reps and performance.
- Return the completed results.

## 9.3 Comparing results

Show useful comparisons such as:

- Exercises completed.
- Weights lifted.
- Repetitions.
- Volume where appropriate.
- Personal improvements.
- Relevant records.
- Exercise-by-exercise performance.

Relative strength comparisons must use defensible methodology.

**Never expose users' actual height or body weight to friends, including through derived statistics that make those values recoverable.**

If a comparison cannot be made fairly without sensitive information, omit that comparison or use an explicitly consented, privacy-preserving alternative.

## 9.4 Exchange interactions

Implement:

- Exchange history.
- Personal messages.
- Reactions.
- Rematches.
- Exchange notifications.
- Completed result summaries.
- Clear exchange statuses.

Workout Exchange is asynchronous.

Do not implement live shared workouts.

---

# PART 10 — CLOSE FRIENDS AND ROMANTIC PARTNERS

Implement optional relationship tiers:

- Regular friend.
- Close friend.
- Romantic partner.

These relationships must require appropriate consent.

Being designated a close friend or romantic partner must **not automatically grant access to all sensitive information**.

Provide granular, revocable sharing permissions for specific information categories.

Potential shared categories include:

- Selected training metrics.
- Specific wellness trends.
- Selected goals.
- Chosen nutrition summaries.
- Joint goals.
- Relationship-specific progress features.

Both users must understand what is being shared.

Enforce access restrictions at the database level.

---

# PART 11 — PROGRESS AND ANALYTICS

Implement comprehensive charts and reports based on actual user records.

Include:

- Strength progression.
- Exercise-specific progression.
- Training volume.
- Workout frequency.
- Personal records.
- Rank history.
- Muscle-group training distribution.
- Calorie intake.
- Macro intake.
- Nutrition consistency.
- Cardio performance.
- Activity trends.
- Weight trends.
- Sleep trends.
- Wellness trends.
- Programme progress.

Support:

- Weekly views.
- Monthly views.
- Annual views.
- Custom date ranges.
- Relevant comparisons.
- Weekly reports.
- Monthly reports.
- Annual Fitness Wrapped.
- Achievements.
- Strength Passport.

Do not substitute missing data with zero unless zero is genuinely recorded.

Do not generate fake insights or unsupported correlations.

---

# PART 12 — SUPABASE BACKEND AND CLOUD STORAGE

A Supabase project has been created for LEX ACTIVE.

Implement the complete backend using Supabase.

## 12.1 Authentication

Implement:

- Email registration.
- Login.
- Logout.
- Email verification.
- Password recovery.
- Session persistence.
- Secure account management.
- Account deletion.

Use Supabase Auth.

## 12.2 Database

Design a properly normalised PostgreSQL schema supporting the entire product.

This includes, as appropriate:

- Profiles.
- User preferences.
- Exercises.
- Custom exercises.
- Workout sessions.
- Workout exercises.
- Workout sets.
- Saved routines.
- Routine exercises.
- Training programmes.
- Programme schedules.
- Exercise records.
- Rank history.
- Foods.
- Food diary entries.
- Recipes.
- Recipe ingredients.
- Saved meals.
- Nutrition goals.
- Cardio sessions.
- Wellness records.
- Measurements.
- Sleep records.
- Friend requests.
- Friendships.
- Relationship tiers.
- Granular sharing permissions.
- Feed posts.
- Reactions.
- Comments.
- Conversations.
- Messages.
- Notifications.
- Challenges.
- Workout Exchanges.
- Exchange results.
- Achievements.
- User privacy settings.

Design for maintainability and scalability rather than creating one oversized table.

## 12.3 Row Level Security

Enable and correctly configure Row Level Security on all relevant user-data tables.

Implement policies ensuring:

- Users can access their own private records.
- Friends see only permitted shared records.
- Unrelated users cannot access private data.
- Close friends and partners see only explicitly authorised information.
- Messages are visible only to authorised participants.
- Workout Exchange records are accessible only to authorised participants.
- Sensitive information is private by default.
- Users cannot impersonate another user or change protected ownership fields.

Test access permissions using multiple distinct user identities.

Do not rely solely on frontend privacy checks.

## 12.4 Storage

Configure appropriate Supabase Storage buckets for:

- Profile pictures.
- Private progress photos.
- Other legitimate user uploads.

Use appropriate access policies.

Do not make private progress photos publicly accessible.

## 12.5 Realtime

Use Supabase Realtime where useful for:

- Messages.
- Notifications.
- Friend requests.
- Exchange status updates.

Avoid unnecessary subscriptions or excessive database traffic.

## 12.6 Environment variables

Use Vite-compatible environment variables for:

- Supabase project URL.
- Supabase publishable key.

Do not commit real credentials.

Do not put database passwords, secret API keys or service-role keys in frontend code.

Create an `.env.example` with safe placeholders.

Explain exactly how to configure the variables in local development and GitHub Actions.

## 12.7 Database migrations

Create version-controlled SQL migrations.

Include:

- Tables.
- Indexes.
- Constraints.
- Relationships.
- RLS policies.
- Storage policies.
- Relevant functions and triggers.

Use Supabase CLI migrations or another authorised deployment workflow when available.

If the environment cannot apply migrations directly, provide precise setup instructions and migration files.

Do not claim the database is deployed until it actually is.

## 12.8 Cloud synchronisation

Implement reliable cross-device synchronisation.

Requirements:

- Offline-first workout logging.
- Local persistence using IndexedDB where appropriate.
- Queued changes while offline.
- Synchronisation after reconnection.
- Conflict detection and handling.
- Duplicate prevention.
- Idempotent operations.
- Clear sync status.
- Error recovery.
- User-confirmed migration of existing local records.
- JSON backup and export.
- No silent data loss.

Existing browser data must be preserved wherever technically possible.

Do not delete local records before confirming successful migration.

---

# PART 13 — HOSTING AND DEPLOYMENT

The existing frontend is intended to run through GitHub Pages.

Repository:

`https://github.com/abbasfazli725-web/lex-active`

Expected GitHub Pages address, subject to actual deployment configuration:

`https://abbasfazli725-web.github.io/lex-active/`

Maintain GitHub Pages compatibility where practical.

For Vite, ensure the correct production base path for the repository.

Configure deployment through GitHub Actions if necessary.

Ensure:

- Production builds work.
- Client-side navigation works.
- Assets load correctly.
- Authentication redirects work.
- Environment variables are configured securely.
- Supabase connections work.
- Mobile Safari functions correctly.

Do not assume GitHub Pages provides a database.

Supabase handles backend data and authentication.

Provide exact deployment and configuration instructions.

---

# PART 14 — MOBILE, PWA AND FUTURE DEVICE INTEGRATION

Implement a high-quality Progressive Web App.

Support:

- Installable home-screen experience.
- App icons.
- Splash-screen presentation where supported.
- Responsive layouts.
- Offline app shell.
- Local data persistence.
- Appropriate update behaviour.
- Mobile Safari compatibility.
- Touch-friendly controls.
- Safe-area handling.
- Reliable navigation.

Where browser capabilities permit, support relevant device integrations.

For capabilities that genuinely require a native iOS application, such as direct Apple Health or Apple Watch integration, clearly document the native dependency and prepare reusable architecture rather than pretending those integrations work in a browser.

Do not claim unsupported PWA capabilities are functional.

---

# PART 15 — PRIVACY, SAFETY AND USER CONTROL

Implement:

- Privacy-first defaults.
- Granular sharing controls.
- Data export.
- Account deletion.
- Blocking.
- Revocable permissions.
- Clear consent.
- Secure authentication.
- Safe file access.
- Appropriate validation.
- Protection against unauthorised data access.
- Secure handling of sensitive health and wellness records.

Users must remain in control of their data.

Privacy controls must be enforced server-side, not just visually.

Avoid exposing sensitive information through notifications, analytics, ranking calculations or other indirect routes.

---

# PART 16 — TESTING AND QUALITY ASSURANCE

Create automated tests covering:

- Authentication.
- Account isolation.
- Row Level Security.
- Workout logging.
- Workout autosave.
- Offline recovery.
- Cloud synchronisation.
- Duplicate prevention.
- Nutrition calculations.
- Exercise progression.
- Ranking calculations.
- Friend requests.
- Friend permissions.
- Messaging access.
- Workout Exchange.
- Notification behaviour.
- Privacy settings.
- Theme persistence.
- Responsive layouts.
- Data export.
- Account deletion.

Run:

- Type checking.
- Linting where configured.
- Unit tests.
- Integration tests.
- Relevant browser tests.
- Production build.
- Dependency security checks.

Fix failures rather than merely reporting them.

Do not claim real iPhone Safari testing unless it was actually performed.

---

# PART 17 — COMPLETE IMPLEMENTATION TRACKING

Create and maintain:

`docs/PRODUCT_SPEC.md`

`docs/FEATURE_CHECKLIST.md`

`docs/ARCHITECTURE.md`

`docs/DATABASE.md`

`docs/DEPLOYMENT.md`

`docs/CONTINUE_DEVELOPMENT.md`

The product specification must contain the full requirements.

The feature checklist must map every requirement to:

- Not started.
- In progress.
- Implemented.
- Tested.
- Blocked by external configuration.

For each feature, distinguish between:

- UI completed.
- Business logic completed.
- Backend completed.
- Security verified.
- Tests passed.
- Production deployed.

Do not mark a feature complete simply because its screen exists.

Do not silently drop requirements.

When a feature depends on external credentials, infrastructure or device capabilities, identify the exact dependency.

---

# PART 18 — DEVELOPMENT AND EXECUTION STRATEGY

You must implement the entire application over successive substantial milestones.

Suggested engineering order:

**Milestone 1 — Foundation and backend**

- Inspect and preserve existing code.
- Confirm GitHub repository state.
- Establish the complete specification and checklist.
- Improve application architecture.
- Implement Supabase authentication.
- Create database migrations.
- Implement Row Level Security.
- Establish local/cloud synchronisation.
- Preserve existing browser data.

**Milestone 2 — Complete training system**

- Advanced exercise library.
- Full workout logging.
- Saved routines.
- Training programmes.
- Personal records.
- Rest timers.
- Smart progression.
- Training analytics.

**Milestone 3 — Complete nutrition and wellness**

- Food search.
- Reliable nutrition calculations.
- Meals and recipes.
- Barcode functionality where feasible.
- Nutrition targets.
- Cardio.
- Wellness and body tracking.
- Relevant insights.

**Milestone 4 — Complete social system**

- Usernames.
- Friend requests.
- Friend profiles.
- Activity feed.
- Reactions.
- Comments.
- Notifications.
- Messaging.
- Friends-only leaderboards.
- Challenges.

**Milestone 5 — Workout Exchange and relationships**

- Full asynchronous Workout Exchange.
- Results comparison.
- Exchange history.
- Messages and rematches.
- Close-friend permissions.
- Partner permissions.
- Joint goals.
- Privacy testing.

**Milestone 6 — Intelligence, rankings and analytics**

- All ten strength ranks.
- Exercise-specific ranks.
- Rank history.
- Strength Passport.
- Advanced charts.
- Adaptive training.
- Adaptive nutrition.
- Weekly and monthly reports.
- Annual Fitness Wrapped.

**Milestone 7 — Product polish and release readiness**

- Premium UI refinement.
- All themes.
- Mobile usability.
- Accessibility.
- Offline reliability.
- Performance optimisation.
- Security audits.
- End-to-end testing.
- Deployment verification.

These milestones describe engineering order, NOT optional product scope.

All agreed features remain required.

## Important continuation rule

Do not stop after completing the first milestone and declare LEX ACTIVE finished.

At the end of each development session:

1. Commit completed changes.
2. Publish changes to GitHub through the available authorised workflow.
3. Run tests and build.
4. Update the checklist.
5. Document any blockers.
6. Record the exact next implementation steps.
7. Continue into the next feature group when execution time and tools permit.

If a session limit prevents further work, leave complete continuation instructions.

Never claim work was pushed to GitHub unless the remote repository confirms it.

Never claim Supabase is connected unless real authentication, database access and security tests succeed.

---

# PART 19 — IMMEDIATE INSTRUCTIONS TO CODEX

Start now.

1. Inspect the existing `lex-active` repository and determine which features are genuinely functional.
2. Verify whether the existing code is actually present on GitHub.
3. Preserve all existing work and local data.
4. Save this complete specification to `docs/PRODUCT_SPEC.md`.
5. Create the comprehensive feature checklist.
6. Identify any missing Supabase configuration.
7. Begin implementing the complete Supabase backend, authentication, database schema, security policies and offline/cloud synchronisation.
8. Continue developing all remaining product features.
9. Write real code, create migrations and run tests.
10. Commit and publish completed work through the authorised GitHub workflow.

Do not respond with only a roadmap or a summary of what you intend to do.

**Implement the application.**

Do not replace missing functionality with mock data, previews or placeholders.

Do not omit requirements simply because they are complex.

Do not introduce paid dependencies without permission.

Ask for user intervention only when genuinely necessary, such as external authorisation, Supabase configuration, credentials or approval of consequential changes.

The final product must be a fully functioning, comprehensive LEX ACTIVE application suitable for real users.

**Build the complete product—not another basic prototype.**
