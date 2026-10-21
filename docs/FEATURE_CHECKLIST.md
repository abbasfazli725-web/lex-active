# Complete feature checklist

Source of truth: [full master specification](PRODUCT_SPEC.md). This register includes every bullet/numbered requirement and normative prose directive (664 entries), with source line numbers. Repeated requirements are retained rather than silently collapsed. **The product is not complete.**

Statuses: Not started, In progress, Implemented, Tested, Blocked by external configuration. UI/logic/backend/security/tests/production are separate. A schema or screen alone is not a finished feature. “Tested” always means the stated local scope, not hosted certification.

## Current evidence

- Existing device logging/themes/history/charts remain functional and original browser data is retained.
- Auth, explicit import, account isolation, queued sync and core social/exchange flows use actual local services and passed browser/API tests.
- SQL migrations cover the wider product's data model; those tables are not equivalent to implemented programmes, recipes, wellness, ranks or reports.
- Private-photo access is tested at the backend; a complete photo gallery and sharing viewer are not yet implemented.
- Hosted SQL/functions/Auth/email/Realtime remain **not deployed or verified by this task** until the owner completes configuration.
- Physical iPhone Safari and complete security/accessibility audits are unrun.

## Domain completion summary

| Domain | UI | Logic | Backend | Security/tests | Hosted production |
|---|---|---|---|---|---|
| Device logging/themes/history/manual nutrition | Implemented | Implemented | Local persistence | Unit + browser tested | Existing release; updated client pending publish |
| Accounts/profiles | Registration/login/recovery/profile implemented; onboarding/photos incomplete | Implemented core flows | Auth + profile migrations | Local Auth/UI isolation tested; hosted email callbacks pending | Blocked on public config + migrations |
| Offline/account sync | Import/status/conflict UI implemented | Outbox/CAS/dedup/tombstones/concurrent-tab safeguards | Normalised RPCs | Unit + real API + cross-device/offline browser tests | Blocked on public config + migrations |
| Friends/feed/messages/notifications | Core workflows implemented; pagination/preferences incomplete | Implemented core flows | RLS/RPC/notification triggers | Multi-identity API + UI tested | Blocked on hosted setup; Realtime delivery unverified |
| Exchange/relationships | Core async exchange and category grants implemented; advanced comparisons/reactions/rematches unfinished | Core snapshots/results/consent | RLS/RPCs | Ownership/block/privacy tests | Blocked on hosted setup |
| Storage/export/deletion | JSON export + deletion implemented; full photo UI/restore unfinished | Handlers implemented | Private buckets + gateway + deletion | Real Auth/Storage handler tests; Deno Edge deployment pending | Blocked on function deployment |
| Training | Fast logging/routines/history/rest/plates/estimated 1RM | Implemented basic calculations | Current core records sync | Unit/browser tested; advanced set/programme workflows incomplete | Included in client release; verify deployment |
| Nutrition | Manual dated entry/edit/delete and totals | Correct recorded totals | Current food entries sync; broader tables only | Unit/browser tested; food APIs/recipes/targets not started | Basic release only |
| Cardio/wellness/photos | Not started | Not started | Schema + private-media groundwork | Access paths tested; workflows unrun | No |
| Ten ranks/passport/intelligence/reports/challenges | Not started | Not started | Schema groundwork only | Unrun | No |

## Requirement register


### Mission and principles

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0001 / L7 | LEX ACTIVE is being created initially for Lex, but it must be designed as a real, scalable application that other users can join. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0002 / L9 | It should combine the best practical functionality of: | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0003 / L11 | **Hevy:** Strength tracking, routines, personal records and workout history. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0004 / L12 | **Fitbod:** Intelligent training recommendations and progression. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0005 / L13 | **MacroFactor:** Accurate nutrition tracking, expenditure estimates and adaptive targets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0006 / L14 | **WHOOP:** Recovery, sleep, readiness and meaningful wellness insights. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0007 / L16 | LEX ACTIVE must have its own identity, design and features. Do not copy proprietary interfaces, algorithms or branding. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0008 / L22 | The entire specification below is the required product scope. Do not silently remove, simplify or replace requirements with placeholders. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 1 — NON-NEGOTIABLE DEVELOPMENT RULES

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0009 / L30 | Work in the existing GitHub repository: | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0010 / L32 | Preserve existing functionality and user data. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0011 / L33 | Inspect the repository before making changes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0012 / L34 | Do not restart the project unless absolutely necessary. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0013 / L35 | Implement real functionality, not decorative buttons or simulated results. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0014 / L36 | All features must be free for users. No subscriptions, advertisements, paid tiers or paywalls. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0015 / L37 | Prefer free-tier infrastructure and free public data sources. Do not introduce paid APIs without permission. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0016 / L38 | Keep all social functionality exclusively inside LEX ACTIVE. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0017 / L39 | Build a genuinely excellent iPhone-first experience that also works on Android, tablets and desktop. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0018 / L40 | Implement all agreed requirements through successive testable development milestones. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0019 / L41 | Do not claim completion until features actually work. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0020 / L42 | Never fabricate workout statistics, nutritional information, social activity, achievements or analytics. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0021 / L43 | Maintain accurate documentation and feature completion tracking. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0022 / L44 | Continue coding rather than stopping after writing a plan. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0023 / L45 | If a session ends, leave the project ready for the next Codex task to continue. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0024 / L51 | Global or public leaderboards. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |
| REQ-0025 / L52 | Instagram, TikTok, Facebook or other external social-media integrations. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |
| REQ-0026 / L53 | External social-media posting or sharing. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |
| REQ-0027 / L54 | Live shared workout sessions. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |
| REQ-0028 / L55 | Exercise tutorial or demonstration video libraries. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |
| REQ-0029 / L56 | Paid subscription features. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |
| REQ-0030 / L57 | Rank-gated functionality. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |
| REQ-0031 / L58 | Automatic sharing of height, body weight, nutrition diaries, progress photos or sensitive measurements with friends. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0032 / L59 | Automatic access to all sensitive information for close friends or romantic partners. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 2 — DESIGN SYSTEM AND USER EXPERIENCE

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0033 / L67 | LEX ACTIVE must feel like a premium, polished, modern fitness application. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0034 / L71 | Sophisticated, elegant and visually beautiful. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0035 / L72 | Intuitive enough for beginners. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0036 / L73 | Powerful enough for experienced gym users. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0037 / L74 | Fast and efficient for everyday logging. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0038 / L75 | Clean and uncluttered. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0039 / L76 | Designed around progressive disclosure: show essential controls first, advanced controls when needed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0040 / L77 | Consistent across every feature. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0041 / L78 | Accessible and responsive. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0042 / L80 | Avoid an overwhelming dashboard filled with unnecessary statistics. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0043 / L94 | Avoid childish, excessively pink or cartoonish styling. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0044 / L104 | Also support following the device's appearance preference. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0045 / L106 | Theme selection must persist across sessions and synchronise with the user's account. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0046 / L112 | Home | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0047 / L113 | Train | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0048 / L114 | Nutrition | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0049 / L115 | Progress | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0050 / L116 | Social | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0051 / L118 | Provide access to profile, settings, notifications and account controls without overcrowding the main navigation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0052 / L124 | Personalised greeting. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0053 / L125 | Today's training plan. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0054 / L126 | Start workout and Quick Log actions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0055 / L127 | Daily calorie and macro progress. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0056 / L128 | Relevant activity and wellness summaries. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0057 / L129 | Recent achievements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0058 / L130 | Current strength rank. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0059 / L131 | Useful personalised insights. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0060 / L132 | Notifications indicator. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0061 / L133 | Customisable dashboard sections. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0062 / L135 | All dashboard information must come from real user data. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0063 / L143 | Polished onboarding. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0064 / L144 | Helpful empty states. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0065 / L145 | Search and filtering. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0066 / L146 | Accessible forms. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0067 / L147 | Clear loading and error states. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0068 / L148 | Confirmation for destructive actions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0069 / L149 | Consistent modals and sheets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0070 / L150 | Useful contextual help. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0071 / L151 | Mobile-friendly date and time selection. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0072 / L152 | Responsive charts. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0073 / L153 | Thoughtful transitions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0074 / L154 | Reliable autosaving. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0075 / L155 | Keyboard accessibility. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0076 / L156 | Screen-reader support. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0077 / L157 | Reduced-motion preferences. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0078 / L158 | Metric and imperial unit preferences. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 3 — STRENGTH TRAINING

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0079 / L164 | Implement a comprehensive strength training system. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0080 / L170 | Searchable exercise catalogue. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0081 / L171 | Muscle-group categorisation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0082 / L172 | Equipment categorisation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0083 / L173 | Exercise variants. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0084 / L174 | Primary and secondary muscles. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0085 / L175 | Custom exercises. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0086 / L176 | Exercise favourites. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0087 / L177 | Exercise substitutions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0088 / L178 | Personal exercise notes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0089 / L179 | Exercise-specific history. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0090 / L180 | Personal records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0091 / L181 | Training recommendations. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0092 / L183 | Do not add exercise tutorial or demonstration video libraries. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |
| REQ-0093 / L189 | Start, pause, resume and finish workouts. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0094 / L190 | Autosaved active sessions. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0095 / L191 | Recovery of interrupted sessions. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0096 / L192 | Exercises with multiple sets. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0097 / L193 | Weight, reps and duration. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0098 / L194 | RIR and RPE. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0099 / L195 | Warm-up sets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0100 / L196 | Working sets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0101 / L197 | Drop sets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0102 / L198 | Failure sets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0103 / L199 | Supersets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0104 / L200 | Unilateral exercise logging. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0105 / L201 | Bodyweight and assisted exercises. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0106 / L202 | Timed exercises. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0107 / L203 | Exercise notes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0108 / L204 | Set notes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0109 / L205 | Workout notes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0110 / L206 | Rest timer. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0111 / L207 | Automatic rest timer options. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0112 / L208 | Exercise reordering. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0113 / L209 | Adding and removing sets. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0114 / L210 | Duplicate previous sets. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0115 / L211 | Previous performance display. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0116 / L212 | Plate calculator. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0117 / L213 | Session duration. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0118 / L214 | Workout volume. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0119 / L215 | Estimated one-rep max where appropriate. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0120 / L216 | Personal records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0121 / L217 | Completion summaries. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0122 / L219 | The logging experience must be fast enough to use comfortably between sets at the gym. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0123 / L223 | Users must be able to create, save, edit, duplicate, delete and launch workout routines. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0124 / L227 | Upper | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0125 / L228 | Lower | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0126 / L229 | Push | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0127 / L230 | Pull | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0128 / L231 | Legs | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0129 / L232 | Glutes | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0130 / L233 | Arms | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0131 / L234 | Full Body | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0132 / L235 | Cardio | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0133 / L236 | Custom | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0134 / L238 | Do not use conventional folder management as the primary organisation method. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0135 / L246 | Multi-day training splits. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0136 / L247 | Weekly schedules. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0137 / L248 | Programme templates. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0138 / L249 | Custom programmes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0139 / L250 | Training blocks. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0140 / L251 | Programme history. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0141 / L252 | Exercise progression. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0142 / L253 | Training volume tracking. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0143 / L254 | Planned deloads. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0144 / L255 | Programme adjustments. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0145 / L256 | Plateau identification. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0146 / L257 | Recovery-aware recommendations where justified. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0147 / L265 | Previous sets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0148 / L266 | Repetitions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0149 / L267 | Load. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0150 / L268 | RIR/RPE. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0151 / L269 | Training consistency. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0152 / L270 | Recent progression. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0153 / L271 | Plateau patterns. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0154 / L272 | User goals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0155 / L276 | Avoid presenting unsupported predictions as scientific certainty. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0156 / L278 | Users must always be able to override suggestions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 4 — NUTRITION

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0157 / L290 | Calories. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0158 / L291 | Protein. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0159 / L292 | Carbohydrates. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0160 / L293 | Fat. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0161 / L294 | Fibre. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0162 / L295 | Relevant additional nutrients when available. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0163 / L296 | Meals and snacks. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0164 / L297 | Daily and weekly targets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0165 / L298 | Historical intake. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0166 / L299 | Target adherence. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0167 / L305 | USDA FoodData Central. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0168 / L306 | Open Food Facts. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0169 / L312 | Food search. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0170 / L313 | Serving sizes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0171 / L314 | Grams and millilitres. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0172 / L315 | Portions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0173 / L316 | Raw versus cooked distinctions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0174 / L317 | Branded foods. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0175 / L318 | Custom foods. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0176 / L319 | Favourites. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0177 / L320 | Recently logged foods. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0178 / L321 | Saved meals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0179 / L322 | Barcode scanning when supported. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0180 / L323 | Source attribution. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0181 / L324 | Clear handling of incomplete nutritional data. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0182 / L328 | Do not treat unreliable crowdsourced entries as unquestionably accurate. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0183 / L334 | Breakfast, lunch, dinner and snacks. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0184 / L335 | Custom meal categories. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0185 / L336 | Saved meals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0186 / L337 | Recipe creation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0187 / L338 | Ingredient lists. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0188 / L339 | Recipe scaling. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0189 / L340 | Nutritional totals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0190 / L341 | Recipe serving sizes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0191 / L342 | Meal planning. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0192 / L343 | Shopping lists. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0193 / L344 | Duplicate previous meals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0194 / L345 | Copy meals between dates. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0195 / L349 | Implement natural-language food entry where reliable parsing is possible. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0196 / L353 | The system should identify likely matches and request confirmation rather than silently inventing nutritional data. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0197 / L361 | Maintenance. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0198 / L362 | Fat loss. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0199 / L363 | Muscle gain. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0200 / L364 | Custom goals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0201 / L365 | Adjustable calorie targets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0202 / L366 | Adjustable macro targets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0203 / L367 | Weight trends. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0204 / L368 | Estimated energy expenditure. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0205 / L369 | Adaptive target suggestions when enough reliable data exists. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0206 / L373 | Do not make unsupported medical claims. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 5 — CARDIO AND DAILY ACTIVITY

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0207 / L381 | Walking. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0208 / L382 | Running. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0209 / L383 | Treadmill. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0210 / L384 | Incline treadmill walking. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0211 / L385 | Cycling. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0212 / L386 | Swimming. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0213 / L387 | Rowing. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0214 / L388 | Stair climber. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0215 / L389 | Elliptical. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0216 / L390 | Other custom cardio activities. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0217 / L394 | Duration. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0218 / L395 | Distance. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0219 / L396 | Pace. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0220 / L397 | Speed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0221 / L398 | Incline. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0222 / L399 | Resistance. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0223 / L400 | Intervals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0224 / L401 | Heart rate when available. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0225 / L402 | Estimated calories when defensible. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0226 / L403 | Personal records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0227 / L404 | Activity notes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0228 / L406 | Include cardio history, charts, progress tracking and selected shareable achievements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 6 — WELLNESS AND BODY TRACKING

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0229 / L414 | Body weight. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0230 / L415 | Body measurements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0231 / L416 | Progress photos. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0232 / L417 | Sleep duration. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0233 / L418 | Sleep quality. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0234 / L419 | Water intake. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0235 / L420 | Mood. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0236 / L421 | Energy. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0237 / L422 | Soreness. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0238 / L423 | Recovery. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0239 / L424 | Readiness. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0240 / L425 | Mobility. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0241 / L426 | Supplements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0242 / L427 | Optional menstrual-cycle information. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0243 / L429 | All sensitive data must remain private by default. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0244 / L431 | Do not require users to provide height, body weight or other sensitive information to use the core app. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0245 / L433 | Do not expose private metrics through derived values, leaderboards or comparison features. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0246 / L435 | Support relevant correlations and trends without claiming medical diagnostic capabilities. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 7 — STRENGTH RANKING SYSTEM

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0247 / L441 | Implement exactly ten ranks, in this order: | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0248 / L443 | Iron | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0249 / L444 | Bronze | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0250 / L445 | Silver | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0251 / L446 | Gold | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0252 / L447 | Platinum | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0253 / L448 | Diamond | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0254 / L449 | Iridium | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0255 / L450 | Ascendant | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0256 / L451 | Mythic | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0257 / L452 | Celestial | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0258 / L456 | Ranks must reflect strength performance, not simply workout attendance. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0259 / L460 | Individual exercise ranks. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0260 / L461 | Overall strength ranking. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0261 / L462 | Rank progression. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0262 / L463 | Rank history. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0263 / L464 | Rank-up celebrations. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0264 / L465 | Strength Passport. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0265 / L466 | Relevant achievements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0266 / L467 | Friends-only leaderboard comparisons. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0267 / L471 | Do not invent population percentiles or claim statistical accuracy without supporting evidence. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0268 / L473 | Avoid favouring users merely because they log more workouts. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0269 / L477 | Ranks must not unlock or restrict application features. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 8 — SOCIAL SYSTEM

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0270 / L489 | User registration. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0271 / L490 | Secure login. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0272 / L491 | Password reset. | In progress | Implemented | Implemented | Supabase Auth | Not verified | Registration/login tested; email callback verification pending | Hosted setup pending |
| REQ-0273 / L492 | Email verification. | In progress | Implemented | Implemented | Supabase Auth | Not verified | Registration/login tested; email callback verification pending | Hosted setup pending |
| REQ-0274 / L493 | Unique usernames. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0275 / L494 | Username availability checks. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0276 / L495 | Profile pictures. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0277 / L496 | Display names. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0278 / L497 | Bios. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0279 / L498 | Profile settings. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0280 / L499 | Privacy settings. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0281 / L500 | Account deletion. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0282 / L501 | Personal profile. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0283 / L502 | Friend profiles. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0284 / L508 | Username search. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0285 / L509 | Send friend requests. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0286 / L510 | Accept friend requests. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0287 / L511 | Decline requests. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0288 / L512 | Cancel requests. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0289 / L513 | Remove friends. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0290 / L514 | Block users. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0291 / L515 | Appropriate privacy controls. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0292 / L521 | Completed workouts. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0293 / L522 | Selected cardio achievements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0294 / L523 | Strength rank achievements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0295 / L524 | Personal records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0296 / L525 | Other explicitly shareable accomplishments. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0297 / L526 | Reactions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0298 / L527 | Comments. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0299 / L528 | Activity details. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0300 / L532 | Nutrition diaries, body weight, height, body measurements, progress photos and sensitive wellness data must remain private by default. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |
| REQ-0301 / L534 | Do not automatically share sensitive information. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |
| REQ-0302 / L538 | Implement an in-app notification inbox for: | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0303 / L540 | Friend requests. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0304 / L541 | Accepted requests. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0305 / L542 | Reactions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0306 / L543 | Comments. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0307 / L544 | Workout Exchange invitations. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0308 / L545 | Returned Workout Exchange results. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0309 / L546 | Messages. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0310 / L547 | Challenges. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0311 / L548 | Relevant achievements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0312 / L550 | Include unread counts and read/unread states. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0313 / L556 | Implement secure in-app messaging with appropriate access controls. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0314 / L558 | Support conversations relevant to friendships, workouts and Workout Exchange. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0315 / L560 | Do not integrate external messaging platforms. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0316 / L564 | Implement friends-only challenges with clear rules, time periods and progress tracking. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0317 / L566 | Avoid challenges that incentivise unsafe training or unhealthy nutritional behaviour. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0318 / L570 | Leaderboards must be **friends-only**. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0319 / L574 | Do not create global or public leaderboards. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |
| REQ-0320 / L576 | Do not reveal body weight or height, directly or indirectly, through leaderboard calculations. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |

### PART 9 — WORKOUT EXCHANGE

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0321 / L584 | Implement it as a complete, functional system. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0322 / L590 | Select an existing routine. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0323 / L591 | Create a workout for exchange. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0324 / L592 | Send it to an accepted friend. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0325 / L593 | Include a personal message. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0326 / L594 | View pending and completed exchanges. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0327 / L600 | Receive an in-app notification. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0328 / L601 | Review the routine. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0329 / L602 | Accept the exchange. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0330 / L603 | Save the routine. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0331 / L604 | Complete the workout independently. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0332 / L605 | Log their own weights, reps and performance. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0333 / L606 | Return the completed results. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0334 / L612 | Exercises completed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0335 / L613 | Weights lifted. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0336 / L614 | Repetitions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0337 / L615 | Volume where appropriate. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0338 / L616 | Personal improvements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0339 / L617 | Relevant records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0340 / L618 | Exercise-by-exercise performance. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0341 / L620 | Relative strength comparisons must use defensible methodology. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0342 / L622 | **Never expose users' actual height or body weight to friends, including through derived statistics that make those values recoverable.** | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |
| REQ-0343 / L624 | If a comparison cannot be made fairly without sensitive information, omit that comparison or use an explicitly consented, privacy-preserving alternative. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |
| REQ-0344 / L630 | Exchange history. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0345 / L631 | Personal messages. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0346 / L632 | Reactions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0347 / L633 | Rematches. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0348 / L634 | Exchange notifications. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0349 / L635 | Completed result summaries. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0350 / L636 | Clear exchange statuses. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0351 / L640 | Do not implement live shared workouts. | Implemented | Excluded by design | No prohibited integration | Not applicable | Review continues | Source review | No prohibited feature added |

### PART 10 — CLOSE FRIENDS AND ROMANTIC PARTNERS

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0352 / L646 | Implement optional relationship tiers: | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0353 / L648 | Regular friend. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0354 / L649 | Close friend. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0355 / L650 | Romantic partner. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0356 / L652 | These relationships must require appropriate consent. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0357 / L654 | Being designated a close friend or romantic partner must **not automatically grant access to all sensitive information**. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |
| REQ-0358 / L656 | Provide granular, revocable sharing permissions for specific information categories. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0359 / L658 | Potential shared categories include: | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0360 / L660 | Selected training metrics. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0361 / L661 | Specific wellness trends. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0362 / L662 | Selected goals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0363 / L663 | Chosen nutrition summaries. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0364 / L664 | Joint goals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0365 / L665 | Relationship-specific progress features. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0366 / L667 | Both users must understand what is being shared. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0367 / L669 | Enforce access restrictions at the database level. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |

### PART 11 — PROGRESS AND ANALYTICS

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0368 / L675 | Implement comprehensive charts and reports based on actual user records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0369 / L679 | Strength progression. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0370 / L680 | Exercise-specific progression. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0371 / L681 | Training volume. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0372 / L682 | Workout frequency. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0373 / L683 | Personal records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0374 / L684 | Rank history. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0375 / L685 | Muscle-group training distribution. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0376 / L686 | Calorie intake. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0377 / L687 | Macro intake. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0378 / L688 | Nutrition consistency. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0379 / L689 | Cardio performance. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0380 / L690 | Activity trends. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0381 / L691 | Weight trends. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0382 / L692 | Sleep trends. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0383 / L693 | Wellness trends. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0384 / L694 | Programme progress. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0385 / L698 | Weekly views. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0386 / L699 | Monthly views. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0387 / L700 | Annual views. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0388 / L701 | Custom date ranges. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0389 / L702 | Relevant comparisons. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0390 / L703 | Weekly reports. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0391 / L704 | Monthly reports. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0392 / L705 | Annual Fitness Wrapped. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0393 / L706 | Achievements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0394 / L707 | Strength Passport. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0395 / L709 | Do not substitute missing data with zero unless zero is genuinely recorded. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0396 / L711 | Do not generate fake insights or unsupported correlations. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 12 — SUPABASE BACKEND AND CLOUD STORAGE

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0397 / L719 | Implement the complete backend using Supabase. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0398 / L725 | Email registration. | In progress | Implemented | Implemented | Supabase Auth | Not verified | Registration/login tested; email callback verification pending | Hosted setup pending |
| REQ-0399 / L726 | Login. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0400 / L727 | Logout. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0401 / L728 | Email verification. | In progress | Implemented | Implemented | Supabase Auth | Not verified | Registration/login tested; email callback verification pending | Hosted setup pending |
| REQ-0402 / L729 | Password recovery. | In progress | Implemented | Implemented | Supabase Auth | Not verified | Registration/login tested; email callback verification pending | Hosted setup pending |
| REQ-0403 / L730 | Session persistence. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0404 / L731 | Secure account management. | In progress | Implemented | Implemented | Supabase Auth | Not verified | Registration/login tested; email callback verification pending | Hosted setup pending |
| REQ-0405 / L732 | Account deletion. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0406 / L742 | Profiles. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0407 / L743 | User preferences. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0408 / L744 | Exercises. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0409 / L745 | Custom exercises. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0410 / L746 | Workout sessions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0411 / L747 | Workout exercises. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0412 / L748 | Workout sets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0413 / L749 | Saved routines. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0414 / L750 | Routine exercises. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0415 / L751 | Training programmes. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0416 / L752 | Programme schedules. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0417 / L753 | Exercise records. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0418 / L754 | Rank history. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0419 / L755 | Foods. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0420 / L756 | Food diary entries. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0421 / L757 | Recipes. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0422 / L758 | Recipe ingredients. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0423 / L759 | Saved meals. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0424 / L760 | Nutrition goals. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0425 / L761 | Cardio sessions. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0426 / L762 | Wellness records. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0427 / L763 | Measurements. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0428 / L764 | Sleep records. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0429 / L765 | Friend requests. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0430 / L766 | Friendships. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0431 / L767 | Relationship tiers. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0432 / L768 | Granular sharing permissions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0433 / L769 | Feed posts. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0434 / L770 | Reactions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0435 / L771 | Comments. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0436 / L772 | Conversations. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0437 / L773 | Messages. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0438 / L774 | Notifications. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0439 / L775 | Challenges. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0440 / L776 | Workout Exchanges. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0441 / L777 | Exchange results. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0442 / L778 | Achievements. | In progress | Not started | Not started | Normalised schema only | Not verified | Schema applied locally; workflows unrun | No |
| REQ-0443 / L779 | User privacy settings. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0444 / L785 | Enable and correctly configure Row Level Security on all relevant user-data tables. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0445 / L789 | Users can access their own private records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0446 / L790 | Friends see only permitted shared records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0447 / L791 | Unrelated users cannot access private data. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0448 / L792 | Close friends and partners see only explicitly authorised information. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0449 / L793 | Messages are visible only to authorised participants. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0450 / L794 | Workout Exchange records are accessible only to authorised participants. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0451 / L795 | Sensitive information is private by default. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |
| REQ-0452 / L796 | Users cannot impersonate another user or change protected ownership fields. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |
| REQ-0453 / L798 | Test access permissions using multiple distinct user identities. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0454 / L800 | Do not rely solely on frontend privacy checks. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0455 / L804 | Configure appropriate Supabase Storage buckets for: | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0456 / L806 | Profile pictures. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0457 / L807 | Private progress photos. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0458 / L808 | Other legitimate user uploads. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0459 / L812 | Do not make private progress photos publicly accessible. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0460 / L818 | Messages. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0461 / L819 | Notifications. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0462 / L820 | Friend requests. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0463 / L821 | Exchange status updates. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0464 / L823 | Avoid unnecessary subscriptions or excessive database traffic. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0465 / L829 | Supabase project URL. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0466 / L830 | Supabase publishable key. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0467 / L834 | Do not put database passwords, secret API keys or service-role keys in frontend code. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0468 / L838 | Explain exactly how to configure the variables in local development and GitHub Actions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0469 / L846 | Tables. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0470 / L847 | Indexes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0471 / L848 | Constraints. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0472 / L849 | Relationships. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0473 / L850 | RLS policies. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0474 / L851 | Storage policies. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0475 / L852 | Relevant functions and triggers. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0476 / L856 | If the environment cannot apply migrations directly, provide precise setup instructions and migration files. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0477 / L858 | Do not claim the database is deployed until it actually is. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0478 / L862 | Implement reliable cross-device synchronisation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0479 / L866 | Offline-first workout logging. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0480 / L867 | Local persistence using IndexedDB where appropriate. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0481 / L868 | Queued changes while offline. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0482 / L869 | Synchronisation after reconnection. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0483 / L870 | Conflict detection and handling. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0484 / L871 | Duplicate prevention. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0485 / L872 | Idempotent operations. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0486 / L873 | Clear sync status. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0487 / L874 | Error recovery. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0488 / L875 | User-confirmed migration of existing local records. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0489 / L876 | JSON backup and export. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0490 / L877 | No silent data loss. | Tested | Implemented | Implemented | RPCs implemented | Local account isolation tested | Local unit/API/browser tests passed | Included in client release; hosted setup pending |
| REQ-0491 / L879 | Existing browser data must be preserved wherever technically possible. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0492 / L881 | Do not delete local records before confirming successful migration. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 13 — HOSTING AND DEPLOYMENT

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0493 / L897 | Maintain GitHub Pages compatibility where practical. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0494 / L899 | For Vite, ensure the correct production base path for the repository. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0495 / L901 | Configure deployment through GitHub Actions if necessary. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0496 / L905 | Production builds work. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0497 / L906 | Client-side navigation works. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0498 / L907 | Assets load correctly. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0499 / L908 | Authentication redirects work. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0500 / L909 | Environment variables are configured securely. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0501 / L910 | Supabase connections work. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0502 / L911 | Mobile Safari functions correctly. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0503 / L913 | Do not assume GitHub Pages provides a database. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0504 / L917 | Provide exact deployment and configuration instructions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 14 — MOBILE, PWA AND FUTURE DEVICE INTEGRATION

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0505 / L923 | Implement a high-quality Progressive Web App. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0506 / L927 | Installable home-screen experience. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0507 / L928 | App icons. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0508 / L929 | Splash-screen presentation where supported. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0509 / L930 | Responsive layouts. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0510 / L931 | Offline app shell. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0511 / L932 | Local data persistence. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0512 / L933 | Appropriate update behaviour. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0513 / L934 | Mobile Safari compatibility. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0514 / L935 | Touch-friendly controls. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0515 / L936 | Safe-area handling. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0516 / L937 | Reliable navigation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0517 / L939 | Where browser capabilities permit, support relevant device integrations. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0518 / L943 | Do not claim unsupported PWA capabilities are functional. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 15 — PRIVACY, SAFETY AND USER CONTROL

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0519 / L951 | Privacy-first defaults. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0520 / L952 | Granular sharing controls. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0521 / L953 | Data export. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0522 / L954 | Account deletion. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0523 / L955 | Blocking. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0524 / L956 | Revocable permissions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0525 / L957 | Clear consent. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0526 / L958 | Secure authentication. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0527 / L959 | Safe file access. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0528 / L960 | Appropriate validation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0529 / L961 | Protection against unauthorised data access. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |
| REQ-0530 / L962 | Secure handling of sensitive health and wellness records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0531 / L964 | Users must remain in control of their data. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0532 / L966 | Privacy controls must be enforced server-side, not just visually. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0533 / L968 | Avoid exposing sensitive information through notifications, analytics, ranking calculations or other indirect routes. | In progress | Not started | Not started | RLS/gateway implemented | Local tests for key access paths passed; full audit pending | Partial privacy suite passed | No |

### PART 16 — TESTING AND QUALITY ASSURANCE

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0534 / L976 | Authentication. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0535 / L977 | Account isolation. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0536 / L978 | Row Level Security. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0537 / L979 | Workout logging. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0538 / L980 | Workout autosave. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0539 / L981 | Offline recovery. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0540 / L982 | Cloud synchronisation. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0541 / L983 | Duplicate prevention. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0542 / L984 | Nutrition calculations. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0543 / L985 | Exercise progression. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0544 / L986 | Ranking calculations. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0545 / L987 | Friend requests. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0546 / L988 | Friend permissions. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0547 / L989 | Messaging access. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0548 / L990 | Workout Exchange. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0549 / L991 | Notification behaviour. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0550 / L992 | Privacy settings. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0551 / L993 | Theme persistence. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0552 / L994 | Responsive layouts. | Tested | Implemented | Implemented | Not required / see sync | Local storage only | Local tests passed | Included in client release; verify deployment |
| REQ-0553 / L995 | Data export. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0554 / L996 | Account deletion. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0555 / L1000 | Type checking. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0556 / L1001 | Linting where configured. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0557 / L1002 | Unit tests. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0558 / L1003 | Integration tests. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0559 / L1004 | Relevant browser tests. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0560 / L1005 | Production build. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0561 / L1006 | Dependency security checks. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0562 / L1010 | Do not claim real iPhone Safari testing unless it was actually performed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 17 — COMPLETE IMPLEMENTATION TRACKING

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0563 / L1030 | The product specification must contain the full requirements. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0564 / L1032 | The feature checklist must map every requirement to: | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0565 / L1034 | Not started. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0566 / L1035 | In progress. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0567 / L1036 | Implemented. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0568 / L1037 | Tested. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0569 / L1038 | Blocked by external configuration. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0570 / L1042 | UI completed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0571 / L1043 | Business logic completed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0572 / L1044 | Backend completed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0573 / L1045 | Security verified. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0574 / L1046 | Tests passed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0575 / L1047 | Production deployed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0576 / L1049 | Do not mark a feature complete simply because its screen exists. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 18 — DEVELOPMENT AND EXECUTION STRATEGY

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0577 / L1059 | You must implement the entire application over successive substantial milestones. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0578 / L1065 | Inspect and preserve existing code. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0579 / L1066 | Confirm GitHub repository state. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0580 / L1067 | Establish the complete specification and checklist. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0581 / L1068 | Improve application architecture. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0582 / L1069 | Implement Supabase authentication. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0583 / L1070 | Create database migrations. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0584 / L1071 | Implement Row Level Security. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0585 / L1072 | Establish local/cloud synchronisation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0586 / L1073 | Preserve existing browser data. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0587 / L1077 | Advanced exercise library. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0588 / L1078 | Full workout logging. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0589 / L1079 | Saved routines. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0590 / L1080 | Training programmes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0591 / L1081 | Personal records. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0592 / L1082 | Rest timers. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0593 / L1083 | Smart progression. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0594 / L1084 | Training analytics. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0595 / L1088 | Food search. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0596 / L1089 | Reliable nutrition calculations. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0597 / L1090 | Meals and recipes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0598 / L1091 | Barcode functionality where feasible. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0599 / L1092 | Nutrition targets. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0600 / L1093 | Cardio. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0601 / L1094 | Wellness and body tracking. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0602 / L1095 | Relevant insights. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0603 / L1099 | Usernames. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0604 / L1100 | Friend requests. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0605 / L1101 | Friend profiles. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0606 / L1102 | Activity feed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0607 / L1103 | Reactions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0608 / L1104 | Comments. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0609 / L1105 | Notifications. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0610 / L1106 | Messaging. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0611 / L1107 | Friends-only leaderboards. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0612 / L1108 | Challenges. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0613 / L1112 | Full asynchronous Workout Exchange. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0614 / L1113 | Results comparison. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0615 / L1114 | Exchange history. | Blocked by external configuration | Implemented or partial | Implemented | Migrations / handlers implemented | Local multi-identity tests passed | Local API/browser tests passed | Hosted setup pending |
| REQ-0616 / L1115 | Messages and rematches. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0617 / L1116 | Close-friend permissions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0618 / L1117 | Partner permissions. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0619 / L1118 | Joint goals. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0620 / L1119 | Privacy testing. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0621 / L1123 | All ten strength ranks. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0622 / L1124 | Exercise-specific ranks. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0623 / L1125 | Rank history. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0624 / L1126 | Strength Passport. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0625 / L1127 | Advanced charts. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0626 / L1128 | Adaptive training. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0627 / L1129 | Adaptive nutrition. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0628 / L1130 | Weekly and monthly reports. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0629 / L1131 | Annual Fitness Wrapped. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0630 / L1135 | Premium UI refinement. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0631 / L1136 | All themes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0632 / L1137 | Mobile usability. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0633 / L1138 | Accessibility. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0634 / L1139 | Offline reliability. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0635 / L1140 | Performance optimisation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0636 / L1141 | Security audits. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0637 / L1142 | End-to-end testing. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0638 / L1143 | Deployment verification. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0639 / L1147 | All agreed features remain required. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0640 / L1151 | Do not stop after completing the first milestone and declare LEX ACTIVE finished. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0641 / L1155 | Commit completed changes. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0642 / L1156 | Publish changes to GitHub through the available authorised workflow. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0643 / L1157 | Run tests and build. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0644 / L1158 | Update the checklist. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0645 / L1159 | Document any blockers. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0646 / L1160 | Record the exact next implementation steps. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0647 / L1161 | Continue into the next feature group when execution time and tools permit. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0648 / L1165 | Never claim work was pushed to GitHub unless the remote repository confirms it. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0649 / L1167 | Never claim Supabase is connected unless real authentication, database access and security tests succeed. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

### PART 19 — IMMEDIATE INSTRUCTIONS TO CODEX

| ID / source line | Requirement | Status | UI | Logic | Backend | Security | Tests | Production |
|---|---|---|---|---|---|---|---|---|
| REQ-0650 / L1175 | Inspect the existing `lex-active` repository and determine which features are genuinely functional. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0651 / L1176 | Verify whether the existing code is actually present on GitHub. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0652 / L1177 | Preserve all existing work and local data. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0653 / L1178 | Save this complete specification to `docs/PRODUCT_SPEC.md`. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0654 / L1179 | Create the comprehensive feature checklist. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0655 / L1180 | Identify any missing Supabase configuration. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0656 / L1181 | Begin implementing the complete Supabase backend, authentication, database schema, security policies and offline/cloud synchronisation. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0657 / L1182 | Continue developing all remaining product features. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0658 / L1183 | Write real code, create migrations and run tests. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0659 / L1184 | Commit and publish completed work through the authorised GitHub workflow. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0660 / L1186 | Do not respond with only a roadmap or a summary of what you intend to do. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0661 / L1190 | Do not replace missing functionality with mock data, previews or placeholders. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0662 / L1192 | Do not omit requirements simply because they are complex. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0663 / L1194 | Do not introduce paid dependencies without permission. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |
| REQ-0664 / L1198 | The final product must be a fully functioning, comprehensive LEX ACTIVE application suitable for real users. | Not started | Not started | Not started | Not started | Not verified | Unrun | No |

## Updating this register

Reassess each layer after implementation and validation. Conservative “Not started” entries may contain partial groundwork; do not promote them merely because a related table exists. The summary states the exact current evidence. Regenerate the baseline with `node scripts/generate-checklist.mjs`, then review and update status decisions as features advance. Full original prose stays in PRODUCT_SPEC.md; source lines support auditability.
