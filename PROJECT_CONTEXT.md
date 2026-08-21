# Project Context

This is the running project log. Append a dated phase entry after every future phase rather than replacing prior history.

## Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: Short-lived JWT access tokens and rotating refresh tokens in `httpOnly` cookies

## Current Phase

Phase 11 — Stitch frontend redesign integration (completed 2026-08-21)

## Folder Structure

```text
client/
├── vercel.json             # Vite production output and React Router SPA rewrite
├── src/api/client.js       # Credentialed API client and access-token refresh
├── src/auth/               # Auth provider and context
├── src/components/         # UI, route guards, global error boundary, and loading skeletons
│   ├── AppLayout.jsx       # Responsive sidebar, account menu, and mobile navigation shell
│   └── Icon.jsx            # Dependency-free navigation and brand SVG icon system
├── src/constants/          # Shared transaction, habit, goal, and asset metadata
├── src/hooks/useAuth.js    # Auth context hook
├── src/pages/              # Auth/profile, trackers, financial views, and the Admin Panel
├── src/test/               # Vitest setup and React Testing Library integration tests
├── src/App.jsx             # Public, protected, and admin route declarations
└── src/main.jsx            # React entry point
server/
├── test/                   # Jest/Supertest integration and security-invariant tests
├── jest.config.js          # Isolated Node test runner configuration
└── src/
    ├── config/             # Environment and MongoDB connection
    ├── controllers/        # Auth, product features, platform administration, feedback, and health
    ├── middleware/         # Auth guards, layered rate limiting, validation, and safe errors
    ├── models/             # User, product data, net-worth snapshots, and feedback schemas
    ├── routes/             # Express routers
    ├── scripts/            # Guarded demo seed and disposable QA smoke journey
    ├── services/           # Shared net-worth and habit-summary queries
    ├── utils/              # Ownership scoping, dates, projections, errors, and JWT/cookies
    ├── validators/         # Request validation chains
    ├── app.js              # Express app composition
    └── server.js           # API process entry point
render.yaml                 # Render API service, environment, and health-check definition
```

## Data Models

- `User` — name, normalized unique email, bcrypt password hash, `user|admin` role, account status/deactivation/soft-deletion metadata, last activity, financial profile, hashed refresh token, and timestamps.
- `Income` — owning user, source, positive two-decimal amount, transaction date, and timestamps.
- `Expense` — owning user, category enum, positive two-decimal amount, transaction date, optional notes, and timestamps.
- `Habit` — owning user, name, financial habit type, `daily|weekly|monthly` frequency, active state, and timestamps.
- `HabitCompletion` — owning user and habit, completion date, normalized period key/start/end, and timestamps; a unique user/habit/period index enforces idempotency.
- `SavingsGoal` — owning user, name, target/current amounts, target date, category, timestamps, and embedded dated contribution records.
- `Asset` — owning user, asset type, name, non-negative current value, valuation date, and timestamps.
- `NetWorthSnapshot` — one UTC-dated record per user with goal savings, asset value, and calculated net worth totals.
- `Feedback` — user-owned feedback or complaint with subject/message, `open|resolved|dismissed` workflow, optional admin note, resolver, and resolution timestamps.

## API Routes Implemented

- `GET /api/health` — reports API health, timestamp, and MongoDB connection state.

### Authentication

- `POST /api/auth/register` — validates input, creates a user, and starts a session.
- `POST /api/auth/login` — verifies credentials and starts a session.
- `POST /api/auth/refresh` — verifies and rotates the refresh token, returning a new access token.
- `POST /api/auth/logout` — invalidates the persisted refresh-token hash and clears the cookie.
- `GET /api/auth/me` — returns the authenticated user from a valid bearer access token.

### User profile

- `GET /api/users/profile` — returns the authenticated user's financial profile.
- `PUT /api/users/profile` — updates name, three-letter currency, and/or monthly income goal.

### Income

- `POST /api/income` — creates an income record for the authenticated user.
- `GET /api/income` — lists the user's income, optionally filtered by `startDate`, `endDate`, and `limit`.
- `PUT /api/income/:id` — updates an owned income record.
- `DELETE /api/income/:id` — deletes an owned income record.

### Expenses

- `POST /api/expenses` — creates an expense using `food`, `transport`, `rent`, `utilities`, `entertainment`, or `other`.
- `GET /api/expenses` — lists the user's expenses with optional category/date filters and limit.
- `PUT /api/expenses/:id` — updates an owned expense record.
- `DELETE /api/expenses/:id` — deletes an owned expense record.
- `GET /api/expenses/summary` — groups expense totals by category between required `startDate` and `endDate` query parameters.

### Reports

- `GET /api/reports/monthly` — returns income and expense totals for every UTC calendar month in the requested window; `months` defaults to 6 and is limited to 1–24.

### Habits

- `POST /api/habits` — creates an active financial habit with a validated name, type, and frequency.
- `GET /api/habits` — lists the user's habits, optionally filtered by active state.
- `GET /api/habits/:id` — returns one owned habit.
- `PUT /api/habits/:id` — updates an owned habit; frequency becomes immutable after the first completion.
- `DELETE /api/habits/:id` — deletes an owned habit and its completion history.
- `POST /api/habits/:id/complete` — idempotently records one completion for the supplied/current UTC day, week, or month.
- `GET /api/habits/:id/streak` — calculates current and longest streaks from normalized completion periods.
- `GET /api/habits/summary` — returns every active habit with streaks, current-period status, 30-day completion rate, and a 30-cell visual history.

### Savings goals

- `POST /api/goals` — creates a user-owned goal with validated amounts, target date, and category.
- `GET /api/goals` — lists the user's goals by nearest target date.
- `GET /api/goals/:id` — returns one owned goal and its contribution history.
- `PUT /api/goals/:id` — updates goal details or manually adjusts the current amount.
- `DELETE /api/goals/:id` — deletes an owned goal and its embedded contribution history.
- `POST /api/goals/:id/contribute` — atomically increments `currentAmount` and appends a dated contribution; exceeding the target requires `allowExceedTarget: true`.
- `GET /api/goals/:id/progress` — returns percentage, remaining amount, recent contribution rate, projected completion date, and `completed|on-track|behind|no-data` status.

### Assets and investments

- `POST /api/assets` — creates a user-owned asset with a validated type, name, current value, and valuation date.
- `GET /api/assets` — lists the user's assets from highest to lowest current value.
- `GET /api/assets/:id` — returns one owned asset.
- `PUT /api/assets/:id` — updates an owned asset or investment.
- `DELETE /api/assets/:id` — deletes an owned asset.
- Asset types are `cash`, `stocks`, `bonds`, `mutual_funds`, `retirement`, `real_estate`, `crypto`, and `other`.

### Net worth and dashboard

- `POST /api/networth/snapshot` — recalculates live totals and upserts the authenticated user's snapshot for the current UTC day.
- `GET /api/networth/history` — lists snapshots chronologically; optional `range` values are `3mo`, `6mo`, `1yr`, and `all`.
- `GET /api/dashboard/summary` — returns current-month income, expenses and savings rate; live net worth; top active habit streaks; active goal progress; recent cross-feature activity; and recent net-worth history in one request.

### Feedback

- `POST /api/feedback` — allows any authenticated active user to submit validated feedback or a complaint.

### Administration

Every `/api/admin/*` route requires both `verifyToken` and `isAdmin` on the parent router.

- `GET /api/admin/users` — lists users with account status, join/last-active dates, 30-day habit completion rate, and live tracked net worth; optional `search`, `status`, and `role` filters are supported.
- `PUT /api/admin/users/:id` — changes a user's role and/or active state; reactivation also restores a soft-deleted account.
- `DELETE /api/admin/users/:id` — soft-deletes an account, revokes its refresh session, and retains all product records.
- `GET /api/admin/analytics` — returns active-user count, weighted 30-day habit completion, average capped savings-goal completion, current-month engagement rate, six-month monthly active users, and monthly financial record activity.
- `GET /api/admin/feedback` — lists feedback with optional status/category filters and submitter details.
- `PUT /api/admin/feedback/:id` — marks feedback open, resolved, or dismissed and records the resolving administrator.

## Pages Implemented

- Login — implemented with client/server validation and API errors
- Register — implemented with client/server validation and API errors
- Financial Dashboard — implemented with live wealth/cash-flow/habit/goal cards, a net-worth trend, closest goals, recent cross-feature activity, empty/loading/error states, and manual snapshot recalculation
- Expense Tracker — implemented with income/expense create and edit forms, deletions, recent transaction filters, summary cards, category donut chart, monthly comparison chart, and complete loading/error/empty states
- Habit Tracker — implemented with habit creation, active habit cards, idempotent current-period completion, current/best streaks, 30-day completion rates and heatmaps, visual reminders, deactivation, deletion, and loading/error/empty states
- Savings Goals — implemented with create/edit forms, optimistic contribution and deletion interactions, progress cards, remaining amounts, quick contributions, target/projection dates, schedule status, confirmations, and loading/error/empty states
- Wealth Analytics — implemented with asset/investment create/edit/delete flows, allocation donut chart, selectable 3-month/6-month/1-year/all net-worth chart, 12-month savings-rate chart, and manual snapshots
- Profile Settings — implemented for name, currency, and monthly income goal
- Admin Panel — implemented with KPI cards, monthly active-user and financial-activity charts, searchable/filterable user management, role/status/soft-delete controls, and a feedback resolution inbox; both route reachability and navigation require the admin role

## Authentication Flow

1. Register/login returns a 15-minute access token in JSON and a seven-day refresh JWT in an `httpOnly` cookie.
2. The client keeps the access token only in memory and adds it as `Authorization: Bearer <token>` on protected requests.
3. The server stores only a SHA-256 hash of the current refresh token. Refresh validates that hash and rotates both tokens.
4. A page reload restores the session through the refresh cookie. A failed refresh clears client auth state and protected routes redirect to Login.
5. Logout invalidates the stored refresh-token hash and clears the cookie. This foundation currently supports one active refresh session per user.
6. Deactivated or soft-deleted accounts are rejected by login, refresh, and access-token middleware. Deactivation revokes the stored refresh token so an existing client session expires immediately on its next protected request.

## Environment Variables

### Added in Phase 2

- Server: `JWT_ACCESS_EXPIRES_IN` (default `15m`)
- Server: `JWT_REFRESH_EXPIRES_IN` (default `7d`)
- Server: `BCRYPT_ROUNDS` (default `12`)
- Server: `COOKIE_SECURE` (default `false`; production also forces secure cookies)
- Client: `VITE_API_URL` (default in code: `http://localhost:5000/api`)

### Phase 3

No environment variables were added.

### Phase 4

No environment variables were added.

### Phase 5

No environment variables were added.

### Phase 6

No environment variables were added.

### Phase 7

No environment variables were added.

### Phase 8

- No environment variables were added.
- The client `.env.example` now contains only `VITE_API_URL`. Database and JWT secrets are server-only and intentionally removed from the browser workspace template; Vite exposes only `VITE_`-prefixed values.

### Phase 9

- Server: `SEED_RESET` (default `false`) — one-shot demo-seed reset switch. Resetting is additionally refused unless the connected database name contains `qa`, `test`, or `demo`.
- No browser environment variables were added.

### Phase 10

- No new application environment keys were introduced.
- Production values are hosted outside the repository: Render stores `MONGO_URI`, JWT secrets, cookie settings, and the exact `CLIENT_URL`; Vercel stores the public `VITE_API_URL`.

### Phase 11

- No environment variables or API contracts were added or changed.

## Hardening Summary

- All income, expense, habit, habit-completion, savings-goal, asset, snapshot, report, and dashboard reads/mutations are scoped to the authenticated user. ID-based operations use the shared `ownedRecordFilter`; nested records use `ownedChildFilter`; collection/aggregate queries use `userScope`. The owner condition is applied last and cannot be overridden by supplied conditions.
- Every body-bearing write route validates types, numbers, dates, enums, and bounded strings with `express-validator`. An allowlist validator rejects unsupported body fields, including MongoDB operator-shaped payloads; no-body mutations reject unexpected payload fields.
- Helmet supplies secure response headers. CORS accepts the configured `CLIENT_URL` (plus requests without a browser Origin header) and rejects other origins. JSON and URL-encoded bodies are capped at 100 KB with a 100-parameter limit.
- Authentication attempts retain their strict limiter; all non-safe API methods also use a 120-write-per-15-minute limiter. Both use standard rate-limit headers.
- `password` and `refreshTokenHash` are `select: false` and are removed by both Mongoose `toJSON` and `toObject` transforms. Error responses no longer expose stack traces, and startup logging no longer prints raw dependency error messages.
- Passwords remain bcrypt hashes, refresh tokens remain SHA-256 hashes, and JWT/database secrets remain server environment values. Financial records are not field-level encrypted by this application; production storage must provide MongoDB encryption at rest, encrypted backups, and TLS in transit.
- A global React error boundary prevents render failures from producing a blank page. Session restoration and every data-heavy page now use responsive skeletons; existing API failures retain page-local error messages and retry actions.
- Mobile gutters now fit 375 px screens, chart containers can shrink without forcing page overflow, wide management tables retain intentional horizontal scrolling, and large savings-goal values wrap. Layouts were reviewed at 375 px, 768 px, and 1280 px breakpoints.
- Financial Dashboard still uses one aggregate request. Other multi-resource pages issue independent requests in parallel. Savings Goals no longer performs one progress request per goal or a post-contribution progress request; progress is included in goal list and mutation responses.
- All protected feature routes are lazy-loaded, including habit, savings-goal, profile, and admin routes. Recharts remains split from the initial application bundle.
- Added query indexes for administrative activity scans, asset value sorting, contribution activity, feedback filtering, and user lifecycle filters.
- `npm test` runs ownership-invariant, owner-scope coverage, unknown-field rejection, credential serialization, and client-environment isolation checks without requiring a database.
- Production startup now fails fast unless MongoDB, distinct strong JWT secrets, an exact HTTPS client origin, and safe bcrypt rounds are configured. Render proxy trust is enabled only in production.
- Unknown production 5xx failures return only `Internal server error`; stack traces and internal messages remain server-side. The production health endpoint returns `503` if MongoDB is disconnected.

## Frontend Redesign Summary

- Integrated the Stitch `Financial Habit & Wealth System` visual direction while preserving the existing React component behavior, routes, API client, auth context, validation, optimistic mutations, error states, and admin authorization.
- Replaced the dark UI with the Stitch palette: warm mint surfaces, white bordered cards, deep charcoal text, growth green, restrained indigo data accents, coral expenses, and amber reminder states.
- Rebuilt the authenticated application shell with a persistent desktop sidebar, sticky header, role-aware account menu, five-destination mobile bottom navigation, and admin/profile links that remain permission-aware.
- Rebuilt Login/Register around a responsive split-screen brand story and compact mobile form without introducing unsupported social login, remember-me, or password-recovery behavior.
- Restyled every dashboard, tracker, goal, wealth, profile, admin, table, skeleton, empty state, error state, form field, and Recharts visualization. Financial values use tabular numerals and data-heavy tables retain local horizontal scrolling.
- Expanded the Financial Dashboard from four combined metric cards to six clearer cards using the same aggregate response: net worth, income, expenses, savings rate, strongest streak, and goals on track. No extra request was introduced.
- Added dependency-free inline SVG navigation/brand icons rather than loading the Material Symbols web font used by Stitch's static HTML export.
- Verified the redesigned Login at 1440 px and 375 px, plus authenticated populated Dashboard views at 1440 px and 375 px and Expense Tracker at 1440 px, against an isolated in-memory database. No Atlas records were read or changed.

## Testing and QA Summary

- The server uses Jest, Supertest, and `mongodb-memory-server`. Eight API integration tests cover register/login/me/refresh/logout, exact-origin CORS, and complete create/list-or-read/update/delete lifecycles for income, expenses, habits, savings goals, and assets. Every feature test includes invalid-input and/or cross-user guessed-id rejection; habit idempotency, completion cleanup, and goal overfunding are also asserted.
- Eight fast server security tests retain static ownership-scope coverage, request-field injection rejection, sensitive-field serialization, browser environment isolation, production error redaction, and production configuration checks. The combined server result is 16 passing tests across two suites.
- The client uses Vitest, jsdom, and React Testing Library. Four integration tests cover Login validation/success navigation, Register password validation/normalized submission, Expense Tracker add-to-edit flow, and current-period habit completion UI refresh.
- Root `npm test` runs both workspaces. `npm ci` followed by `npm test` was verified in a dependency-free copy of the repository; the final local result is 16 server tests and 4 client tests passing.
- `server/src/scripts/seed.js` creates guarded, realistic demo/admin fixtures, six months of cash-flow and net-worth history, active and fully funded goals, assets, habit streak examples, and feedback. It was run against a clean temporary `wht_qa` database and verified with 3 users, 6 income records, 18 expenses, 3 habits, 3 goals, and 3 assets.
- `server/src/scripts/qaSmoke.js` reruns the seed in disposable MongoDB and exercises the signup/zero-data dashboard, profile, income/expense, habit idempotency, goal completion, assets/snapshots, ownership attack, feedback, admin analytics/roles/deactivation/reactivation, logout, and soft-delete journeys. Every check passed. The human-facing checklist lives at root `MANUAL_QA.md`.
- QA found no product-logic regression. It did find an out-of-sync root lockfile that caused clean `npm ci` to fail and a missing Node-global ESLint scope for the CommonJS Jest setup; both were fixed and revalidated.

## Production Deployment

- Live client: `https://financial-habit-builder-eight.vercel.app`
- Live API: `https://financial-habit-builder-api-s3j5.onrender.com/api`
- Health check: `https://financial-habit-builder-api-s3j5.onrender.com/api/health`
- Hosting: Vercel production deployment for the Vite client; Render Node web service in Singapore on the free plan; MongoDB Atlas for production persistence.
- CORS: the API accepts browser credentials only from the exact Vercel production origin. A live request from that origin returned `200`; an untrusted origin returned `403` without an allow-origin header.
- Live API smoke: fresh register and login, income, expense, habit completion, savings-goal contribution, asset creation, net-worth snapshot, dashboard aggregate, wealth analytics data, feedback, admin promotion, user listing, platform analytics, and feedback inbox all passed.
- Live Chrome smoke: normal-user login and feature pages, logout, admin login and Admin Panel, and page containment at 375 px, 768 px, and 1280 px all passed with no unexpected console errors, page exceptions, or 5xx responses.
- Smoke data was removed after verification: exactly two generated QA accounts and their eight associated records were permanently deleted. No user-created data was changed.

## Build Wrap-up

The completed product now includes secure JWT sessions, financial profiles, cash-flow tracking and reports, habit periods and streaks, savings-goal projections and contributions, assets and net-worth history, aggregate dashboards, platform administration, feedback handling, responsive chart-driven React pages, ownership and validation hardening, automated server/client tests, guarded demo fixtures, repeatable QA, and a verified production deployment. The root README is the operational entry point; this file remains the architectural and decision history.

## Known Issues / TODO

- Automated screenshot-based visual regression is not included yet; this redesign received one-off real-browser desktop/mobile visual verification in addition to component integration coverage, the disposable API journey, and `MANUAL_QA.md`.
- Decide whether multi-device sessions are needed; the current single refresh-token hash intentionally allows one active session per account.
- Replace the in-memory rate-limit store with a shared Redis-compatible store before horizontally scaling the API.
- Application-level field encryption is not implemented for financial records; production MongoDB encryption, encrypted backups, TLS, access controls, and key rotation remain deployment responsibilities.

## Decisions Log

### 2026-08-19 — Phase 1

- Used npm workspaces so client and server dependencies install from the repository root.
- Kept browser routing in one declarative route tree under `client/src/App.jsx`.
- Allowed the API to start without `MONGO_URI` for scaffold-only development; when a URI is configured, startup waits for a successful MongoDB connection.
- Kept JWT dependencies in the server foundation but intentionally deferred token and user business logic.

### 2026-08-19 — Phase 2

- Chose rotating refresh JWTs with only a SHA-256 token hash stored in MongoDB, so a database leak does not expose usable refresh tokens.
- Kept access tokens in React memory rather than local storage to reduce exposure to persistent cross-site scripting attacks.
- Mounted `verifyToken` on the entire `/api/users` router and kept `/api/health` public as an operational exception.
- Added reusable `isAdmin` middleware and a client admin route guard; admin business APIs remain deferred.
- Used one stored refresh-token hash per user for a simple, revocable single-session foundation.

### 2026-08-19 — Phase 3

- Scoped every income, expense, summary, and report query to the authenticated user's id; update/delete queries combine user id and record id to prevent cross-account access.
- Used MongoDB `Number` amounts rounded to two decimals for this phase's simple cash-flow records. Revisit integer minor units or `Decimal128` before advanced accounting/import features.
- Standardized expense categories in matching backend and frontend lists: `food`, `transport`, `rent`, `utilities`, `entertainment`, and `other`.
- Defined date-only filters as inclusive UTC days and monthly reports as UTC calendar months, returning zero-filled months for stable chart axes.
- Made the Expense Tracker a lazy-loaded route so Recharts does not increase the initial authenticated application bundle.

### 2026-08-19 — Phase 4

- Normalized habit periods in UTC: daily periods are UTC dates, weeks begin Monday, and monthly periods begin on the first day.
- Enforced one completion per user/habit/period with a unique MongoDB index and an upsert that treats concurrent duplicate requests as successful idempotent completions.
- Defined the current streak with an open-period grace rule: if the current day/week/month is not complete yet, the consecutive streak through the immediately previous period remains current.
- Calculated the 30-day rate over distinct periods that overlap the last 30 calendar days; this yields 30 daily opportunities, roughly five weekly opportunities, or two monthly opportunities.
- Prevented frequency changes once completion history exists rather than silently reinterpreting historical periods.
- Batched summary completion loading across all active habits and returned day-level visualization data for the frontend heatmap and reminder indicator.

### 2026-08-19 — Phase 5

- Embedded contribution records inside each savings goal so incrementing the balance and logging the contribution happen in one atomic MongoDB update.
- Enforced the no-overfunding rule inside the atomic contribution query for concurrency safety; callers can opt in explicitly with `allowExceedTarget: true`.
- Based projections on the observed average daily contribution rate over at most the last 90 days, using the goal creation date to shorten the observation window for newer goals.
- Returned an explicit `no-data` state when there is no recent contribution pace rather than presenting an unreliable projected date.
- Allowed `PUT /api/goals/:id` to manually adjust `currentAmount` as requested by CRUD semantics; these manual adjustments do not create contribution log entries or influence the recent-rate projection.
- Used optimistic client updates for contributions, edits, and confirmed deletions, with snapshots for rollback when the primary API mutation fails.

### 2026-08-19 — Phase 6

- Defined live net worth as the sum of savings-goal `currentAmount` values and asset `currentValue` values. Users should avoid entering the same cash balance as both goal savings and a cash asset, because that would intentionally count it twice.
- Chose explicit manual snapshot recalculation over implicit writes after every income, expense, goal, or asset mutation. The dashboard still calculates live net worth on every summary request, flags stale history, and lets the user deliberately record a stable historical point; the UTC-day upsert makes repeated recalculation idempotent.
- Kept every asset, snapshot, and dashboard query scoped to the authenticated user. Asset update/delete filters include both the user and record id to prevent cross-account access.
- Used UTC dates for the unique daily snapshot and calendar-based `3mo`, `6mo`, and `1yr` history cutoffs, with `all` available for the complete timeline.
- Shared the active-habit summary service between the Habit Tracker endpoint and dashboard aggregate so streak semantics cannot drift between pages.
- Built the Financial Dashboard around one aggregate API call to avoid client-side request waterfalls. Recent activity merges income, expenses, habit completions, and savings contributions before sorting.
- Lazy-loaded the chart-heavy Financial Dashboard, Expense Tracker, and Wealth Analytics routes so Recharts and their page code stay out of the initial application bundle.

### 2026-08-19 — Phase 7

- Chose soft deletion for user removal. `DELETE /api/admin/users/:id` records `deletedAt`, deactivates the account, and revokes its refresh token while retaining financial, habit, goal, asset, snapshot, and feedback records for auditability. An admin can explicitly restore the account through the status update route.
- Prevented administrators from changing or deleting their own account through the management endpoints, avoiding accidental self-demotion or lockout. The requesting admin remains available when another administrator is changed.
- Treated legacy users without an `isActive` field as active because Mongoose defaults do not backfill existing MongoDB documents; all newly created users persist `isActive: true`.
- Added a throttled `lastActiveAt` write at most once every five minutes during protected requests, plus immediate updates at session creation, to provide useful activity data without writing on every API call.
- Defined per-user tracked net worth using the same live formula as the dashboard: savings-goal balances plus current asset values. The admin response carries each user's currency so values are not mislabeled.
- Defined habit completion as a weighted rate across all completion opportunities during the last 30 days. Savings-goal completion averages each goal's percentage with individual goals capped at 100%.
- Defined monthly active users from distinct active accounts with authenticated, income, expense, habit-completion, goal-contribution, or asset activity. Historical engagement is inferred from real record creation timestamps; `lastActiveAt` adds current/future authenticated engagement.
- Reported monthly financial activity as counts of income and expense records rather than summing money across accounts with different currencies.
- Enforced admin access twice: the client `AdminRoute` redirects non-admin users to the dashboard, while the server independently applies `verifyToken` and `isAdmin` to the entire admin router.
- Lazy-loaded the Admin Panel so its Recharts dashboard and management code do not increase the initial application bundle.

### 2026-08-19 — Phase 8

- Centralized ownership predicates and added executable regression checks so guessed IDs always resolve inside the authenticated user's scope or return not found.
- Kept controller payloads explicitly whitelisted and added request-body field allowlists at the validation boundary, providing defense in depth against operator injection and accidental mass assignment.
- Selected a 100 KB request limit and 120 writes per 15 minutes as conservative defaults for this JSON-only application. Authentication has its own stricter 20-attempt limit.
- Allowed Origin-less requests for server-to-server, CLI, mobile, and health-check clients while requiring an exact `CLIENT_URL` match for browser Origin headers.
- Applied sensitive-field removal to both JSON and object serialization because application code and future services may use either conversion path.
- Did not add bespoke financial-field encryption without a key-management design. Password and refresh-token one-way protection are implemented; database encryption and TLS are explicitly deployment requirements.
- Returned calculated goal progress with goal reads and mutations to remove the Savings Goals N+1 request pattern while preserving the dedicated progress endpoint for direct consumers.
- Added a single application-level error boundary plus page-local API error/retry states: the former contains render defects, while the latter preserves actionable request-specific recovery.
- Standardized skeleton loading and responsive containment across Login/session restoration, Financial Dashboard, Expense Tracker, Habit Tracker, Savings Goals, Wealth Analytics, Profile, and Admin Panel flows.

### 2026-08-19 — Phase 9

- Chose `mongodb-memory-server` for Jest/Supertest integration tests so tests never read, clear, or depend on a developer database. Suites run serially to keep one deterministic database lifecycle.
- Covered each requested feature as a full API lifecycle and paired it with an invalid-input or cross-account negative assertion, rather than mocking controllers or Mongoose ownership behavior.
- Kept frontend tests at the user-interaction boundary: typed form input, rendered validation, navigation, transaction edit mode, and refreshed habit state are asserted through accessible labels and roles.
- Added a guarded seed reset instead of an unrestricted database drop. Only known application collections are cleared, `SEED_RESET=true` must be explicit, and the database name must identify a QA/test/demo target.
- Added a repeatable disposable QA smoke command alongside the written manual checklist so high-value API journeys can be rerun consistently while real-browser visual checks remain manual.
- Kept known seed credentials limited to disposable demo environments. The seed and QA output never prints MongoDB connection strings or JWT values.

### 2026-08-21 — Phase 10

- Split production hosting by runtime: Vercel serves the static Vite application while Render runs the stateful Express process; MongoDB Atlas remains the persistence layer.
- Added fail-fast production configuration validation, exact HTTPS-origin enforcement, Render proxy trust, database-aware health status, and generic 5xx client responses.
- Generated independent JWT secrets inside Render and kept all deployment credentials and MongoDB values outside Git and the Vite client bundle.
- Persisted `VITE_API_URL` in Vercel and restricted Render `CLIENT_URL` to the stable production alias rather than the immutable one-off deployment URL.
- Used seed-free, uniquely named QA accounts for live validation. A dedicated test account was temporarily promoted to admin, the full browser/API journeys were completed, and all generated accounts and records were then removed.
- Confirmed the intentionally wide asset/admin tables stay inside local horizontal-scroll containers; the document itself remains contained at 375 px after responsive chart layout settles.

### 2026-08-21 — Phase 11

- Treated the Stitch export as a visual reference rather than copying its static mock HTML, keeping the tested React state and live API wiring as the behavioral source of truth.
- Kept the original route paths and role guards. Admin navigation is rendered only for administrators, and the existing `AdminRoute` still rejects direct non-admin navigation.
- Chose a five-item mobile bottom bar for the highest-frequency product areas; Profile, Admin, and Logout remain available through the account menu so the 375 px navigation stays readable.
- Used the existing Tailwind and Recharts stack without adding a UI or icon dependency. A small local SVG icon component keeps the shell fast and avoids a runtime font/CDN dependency.
- Preserved all original fields and actions even where the static Stitch mock showed fewer controls, preventing the redesign from silently removing edit, delete, filtering, validation, or operational states.
- Verified `npm run lint --workspace client`, `npm test --workspace client` (4 passing), and `npm run build --workspace client` after integration.
