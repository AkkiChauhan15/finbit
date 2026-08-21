# Manual QA Checklist

Run this checklist against a disposable database. Never set `SEED_RESET=true` for production or a shared development database. The seed script has an additional safety check: the database name must contain `qa`, `test`, or `demo` before it will clear application collections.

## Setup

- [ ] Install from the repository root with `npm install`.
- [ ] Point `MONGO_URI` at a clean disposable database whose name contains `qa`, `test`, or `demo`.
- [ ] Run `SEED_RESET=true npm run seed --workspace server` and confirm the command reports demo, admin, and inactive fixtures without printing the MongoDB URI or JWT secrets.
- [ ] Start both apps with `npm run dev`; confirm `GET /api/health` is `200` and the client opens without console errors.
- [ ] Confirm layouts at 375 px, 768 px, and 1280 px widths while completing the journeys below.

## Signup-to-dashboard journey

- [ ] Register a new user with a unique email and a password of at least eight characters; confirm invalid email, short password, and password mismatch messages appear before submission.
- [ ] Confirm successful signup lands on Financial Dashboard and a reload restores the session through the refresh cookie.
- [ ] Confirm the new-user dashboard shows zero-value/empty states without errors.
- [ ] Update name, currency, and monthly income goal in Profile; reload and confirm the values persist.
- [ ] Add income and an expense, edit both, filter the expense list, and confirm the summary/chart data updates; delete the temporary records.
- [ ] Create a daily habit, mark it done twice, and confirm only one completion exists for today and the UI reads “Done today.”
- [ ] Create a savings goal, add a contribution, edit it, and confirm progress, remaining amount, and schedule indicator update.
- [ ] Add and update an asset, manually recalculate net worth, and confirm Dashboard and Wealth Analytics reflect it; delete the temporary asset.
- [ ] Log out and confirm protected URLs redirect to Login; log back in and confirm the account data remains.

## Admin journey

Use `admin@wealth.local` / `AdminDemo123!` from the disposable seed only.

- [ ] Confirm Admin appears in navigation and `/admin` loads for the seeded admin.
- [ ] Search for `demo@wealth.local`; filter active/inactive accounts and user/admin roles.
- [ ] Promote then demote the demo user and confirm the role changes persist without exposing credential fields.
- [ ] Deactivate the demo user and confirm their next protected API request is rejected; reactivate them and confirm login works again.
- [ ] Confirm attempting to change or remove the signed-in administrator’s own account is blocked.
- [ ] Review active-user, habit-completion, savings-goal, engagement, and financial-activity KPIs and confirm charts render seeded data.
- [ ] Open the feedback inbox, resolve one fixture with an admin note, and dismiss the other; confirm status filters work.
- [ ] Log in as a normal user and enter `/admin` directly; confirm redirect to Dashboard and a direct `/api/admin/*` request returns `403`.

## Edge cases

- [ ] Zero-data new user: Dashboard, Expense Tracker, Habit Tracker, Savings Goals, and Wealth Analytics show helpful empty states, not blank charts or crashes.
- [ ] Fully funded goal: `New laptop` displays 100%, zero remaining, and completed; an additional contribution is rejected unless explicit overfunding is enabled.
- [ ] Habit streak reset: `Missed-day streak example` has two older consecutive completions, missed yesterday, and shows current streak `0` with longest streak `2`.
- [ ] Idempotent completion: repeat today’s completion request for the same habit and confirm it returns success without creating a duplicate.
- [ ] Ownership: copy an income/expense/habit/goal/asset id from one account and request/update/delete it as another account; confirm `404` and verify the owner’s record is unchanged.
- [ ] Validation: try negative amounts, invalid dates/enums, overlong notes, and unexpected fields such as `$set`; confirm `422` and no records are written.
- [ ] Resilience: stop the API while a page is open; confirm an error state/retry action or error boundary appears instead of a blank page, then restart and recover.
