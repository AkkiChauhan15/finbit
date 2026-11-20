## Three recommended real-world features

   Feature                                        Real-life problem solved                                               Minimum implementation
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Monthly budgets                                Users spend without knowing when they are approaching a limit          Category-wise limits, budget-vs-actual progress, 80% and 100% warnings, monthly summary
  ─────────────────────────────────────────────  ─────────────────────────────────────────────────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────
   Recurring bills and subscriptions              Rent, EMIs, SIPs, and subscriptions are forgotten                      Recurring item, frequency, next due date, upcoming/overdue dashboard alerts, “mark as paid”
  ─────────────────────────────────────────────  ─────────────────────────────────────────────────────────────────────  ─────────────────────────────────────────────────────────────────────────────────────────────────
   Financial health and emergency-fund planner    Users see numbers but do not know whether they are financially safe    Savings-rate score, expense trend, emergency-fund coverage, recommendations, what-if calculator

  ### 1. Monthly budget management

  Example: A user sets ₹8,000 for food and ₹3,000 for transport. The application shows:

  - ₹6,700 of ₹8,000 spent
  - 84% used
  - “You are close to your food budget”
  - Remaining daily allowance for the month

  Reuse the existing expense categories and transactions. This makes the feature naturally integrate with the current project.

  Suggested API:

  POST   /api/budgets
  GET    /api/budgets?month=2026-08
  PUT    /api/budgets/:id
  DELETE /api/budgets/:id
  GET    /api/budgets/summary?month=2026-08

  ### 2. Recurring bills and payment reminders

  Users can add rent, electricity bills, insurance, SIPs, salaries, and subscriptions.

  Important design decision: do not automatically create a financial transaction without confirmation. Display a reminder and let the user select “Mark as paid,” which then creates the expense. This prevents duplicate or incorrect records.

  Useful states:

  Upcoming → Due today → Overdue → Paid

  This can initially use in-app dashboard notifications, avoiding the extra complexity and cost of SMS/email services.

  ### 3. Financial health and emergency-fund planner

  Calculate a transparent score from existing information:

  Financial health score =
    savings rate
    + emergency-fund coverage
    + budget adherence
    + goal consistency

  Show explanations instead of only displaying a number:

  - “Your average essential expenses are ₹24,000/month.”
  - “Your emergency fund covers 2.1 months.”
  - “Recommended target: 6 months or ₹1,44,000.”
  - “Saving ₹5,000/month will reach this target in approximately 20 months.”

  Avoid calling this AI unless you actually integrate and evaluate an AI model. A deterministic recommendation engine is easier to test, explain, and defend academically.

  Other useful future features include debt/EMI payoff planning, CSV import/export, household budgets, multi-currency support, receipt uploads, and a PWA. Keep those as backlog items instead of attempting everything.

  ## Four-person collaboration split

  You plus three collaborators can divide the work as follows:

   Person            Responsibility                                                  Expected evidence
  ━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   You/team lead     CI/CD, Docker, integration, dashboard changes, documentation    DevOps PR and integration PR
  ────────────────  ──────────────────────────────────────────────────────────────  ───────────────────────────────────────────
   Collaborator 1    Monthly budget feature                                          Model, APIs, UI and tests
  ────────────────  ──────────────────────────────────────────────────────────────  ───────────────────────────────────────────
   Collaborator 2    Recurring bills and reminders                                   Model, APIs, UI and tests
  ────────────────  ──────────────────────────────────────────────────────────────  ───────────────────────────────────────────
   Collaborator 3    Financial-health planner                                        Calculation service, UI, charts and tests

  Each person should complete genuine work through their own GitHub account. Do not have everyone commit directly to main.

  Recommended workflow:

  1. Create one GitHub Issue per feature.
  2. Assign each issue to its owner.
  3. Use branches such as:

  feature/monthly-budgets
  feature/recurring-bills
  feature/financial-health
  devops/ci-docker

  4. Open pull requests referencing the issue, for example Closes #12.
  5. Require another member to review the PR.
  6. Merge only after CI passes.
  7. Use squash merging for a readable history.

  For a personal GitHub repository, go to Settings → Collaborators/Collaborators & teams → Add people, invite all three usernames, and have them accept the invitations. GitHub Free supports collaborators on public and private personal repositories. GitHub collaborator
  documentation (https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration)

  A collaborator merely appearing in Settings is weak evidence. Show your teacher:

  - Assigned issues
  - Separate branches
  - Commits authored by each member
  - Pull-request discussions
  - Reviews and approvals
  - Successful CI checks
  - GitHub Insights contributor graph

  ## DevOps features to add

  Your project currently has deployment configuration but no .github CI workflows or Docker files.

  ### 1. GitHub Actions CI

  Create .github/workflows/ci.yml that runs for every pull request and push to main:

  Checkout
     ↓
  Install Node 20
     ↓
  npm ci
     ↓
  Lint and formatting check
     ↓
  Server and client tests
     ↓
  Production build

  Use the project’s existing commands:

  npm ci
  npm run lint
  npm run format:check
  npm test
  npm run build

  GitHub officially recommends setup-node and npm ci for repeatable Node.js workflows. GitHub Node.js CI guide (https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)

  ### 2. Protect main

  Create a ruleset targeting main with:

  - Pull request required
  - At least one approval
  - CI status check required
  - Conversations resolved before merging
  - Force pushes blocked
  - Branch deletion blocked

  GitHub rulesets can enforce pull requests and passing status checks before merging. GitHub ruleset documentation (https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)

  ### 3. Docker and Docker Compose

  Add:

  client/Dockerfile
  server/Dockerfile
  docker-compose.yml
  .dockerignore

  The compose environment should start:

  React client + Express API + MongoDB

  Teacher explanation:

  > Docker packages the application and its runtime configuration so every developer and deployment environment runs a consistent setup. Docker Compose starts the complete application with one command.

  ### 4. Dependency and security automation

  Add .github/dependabot.yml for weekly npm dependency checks. Enable:

  - Dependabot alerts
  - Dependabot security updates
  - CodeQL for JavaScript
  - GitHub secret scanning, if available
  - npm audit in a scheduled security workflow

  Dependabot can generate pull requests for vulnerable and outdated dependencies. GitHub Dependabot guide (https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/dependabot-quickstart)

  ### 5. Complete the CD story

  You already have:

  - Frontend deployment through Vercel
  - Backend deployment through Render
  - MongoDB Atlas
  - render.yaml as deployment configuration
  - /api/health for health monitoring

  Configure deployment only from main. The complete flow becomes:

  Developer branch
        ↓
  Pull request and review
        ↓
  GitHub Actions CI
        ↓
  Protected main branch
        ↓
  Vercel + Render automatic deployment
        ↓
  Health endpoint verification

  Also add a post-deployment smoke check that calls /api/health. Store every credential in GitHub, Render, or Vercel secrets—never in the repository.

  ## Suggested evaluation explanation

  You can present it like this:

  > Our original system recorded expenses, habits, goals, and wealth. The limitation was that it remained reactive: it showed users what had already happened. We extended it into a proactive financial-planning system using category budgets, recurring-payment reminders,
  > and an explainable financial-health planner.

  Then explain DevOps:

  > Every feature is developed in a separate branch and submitted through a pull request. GitHub Actions installs dependencies in a clean environment, checks formatting and linting, runs frontend and backend tests, and creates the production build. The protected main
  > branch prevents unreviewed or failing code from being merged. After a successful merge, Vercel and Render deploy the application automatically, and the health endpoint verifies backend availability.

  For the live demonstration:

  1. Show GitHub Issues and assignments.
  2. Open a contributor’s pull request and its review.
  3. Show a successful GitHub Actions run.
  4. Demonstrate a failing check blocking a merge, if practical.
  5. Start the Docker Compose environment.
  6. Add an expense and show a budget alert.
  7. Mark a recurring bill as paid.
  8. Show the updated financial-health recommendation.
  9. Merge or show a merged PR and the resulting deployment.

  This scope gives every collaborator meaningful work, solves recognizable real-life problems, and provides a clear CI/CD and teamwork story for evaluation.
