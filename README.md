# Financial Habit Builder & Wealth Growth Tracker

Production-ready full-stack application for building financial habits, tracking cash flow and goals, and monitoring wealth growth.

## Live deployment

- Application: [https://financial-habit-builder-eight.vercel.app](https://financial-habit-builder-eight.vercel.app)
- API health: [https://financial-habit-builder-api-s3j5.onrender.com/api/health](https://financial-habit-builder-api-s3j5.onrender.com/api/health)
- API base URL: `https://financial-habit-builder-api-s3j5.onrender.com/api`

The React client runs on Vercel, the Express API runs on Render, and production data is stored in MongoDB Atlas. The live deployment was verified on August 21, 2026 with a seed-free registration and complete user/admin smoke journey.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Install

From the repository root:

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env` with your MongoDB URI and two different, long random JWT secrets. Set `VITE_API_URL` in `client/.env` if the API is not available at `http://localhost:5000/api`. Vite only exposes variables prefixed with `VITE_`; the shared, unprefixed values in `client/.env` remain unavailable to browser code.

## Run locally

Start the client and server together:

```bash
npm run dev
```

Or start them separately in two terminals:

```bash
npm run dev:server
npm run dev:client
```

- Client: <http://localhost:5173>
- API health check: <http://localhost:5000/api/health>

The health endpoint can boot without `MONGO_URI`, but registration, login, session refresh, and profile features require MongoDB plus `JWT_SECRET` and `JWT_REFRESH_SECRET`.

## Production deployment

- `render.yaml` defines the Node web service, production environment, generated JWT secrets, and `/api/health` check.
- `client/vercel.json` defines the Vite output and SPA rewrite required for React Router deep links.
- Render `CLIENT_URL` is restricted to the exact Vercel production origin.
- Vercel `VITE_API_URL` points to the Render `/api` base URL.
- Production startup requires a MongoDB URI, distinct 32+ character JWT secrets, an HTTPS client origin, and bcrypt rounds from 10–15.

The free Render instance can require a short cold-start period after inactivity.

## Docker

Run the full stack (MongoDB + API + web) locally:

```bash
docker compose up --build
# Port 8080 busy?  CLIENT_PORT=8088 docker compose up --build
```

- App: <http://localhost:8080>, API health: <http://localhost:8080/api/health>
- `server/Dockerfile`: Express API on `node:22-bookworm-slim`, production deps only, non-root, healthcheck.
- `client/Dockerfile`: Vite build served by nginx. nginx serves the SPA and proxies `/api` to the API container, so the browser stays on the same origin.
- Both images build from the repository root, which holds the npm workspace lockfile: `docker build -f server/Dockerfile .`

## Infrastructure (Terraform → AWS)

`terraform/` provisions one EC2 host (Ubuntu 24.04, default VPC) with an Elastic IP, a security group allowing only 80/443, an IAM role for SSM, and generated JWT secrets. On first boot the host installs Docker and runs `deploy/docker-compose.prod.yml`:

```text
Caddy (auto-HTTPS :443) → client (nginx) → server (Express) → MongoDB (container or Atlas)
```

With no `domain_name` set, the app is served at `https://<elastic-ip-with-dashes>.sslip.io`, which gives HTTPS (required by the production env checks) without a domain.

```bash
cd terraform
cp backend.hcl.example backend.hcl          # point at your S3 state bucket
cp terraform.tfvars.example terraform.tfvars
terraform init -backend-config=backend.hcl
terraform apply
terraform output app_url
```

## CI/CD (GitHub Actions)

| Workflow        | Trigger                                          | What it does                                                                                                   |
| --------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `ci-cd.yml`     | PRs, pushes to `main`, `v*` tags                 | lint, format check, tests, client build → build images (pushed to GHCR except on PRs) → deploy to EC2 over SSM |
| `terraform.yml` | changes to `terraform/**` or `deploy/**`, manual | `fmt` + `validate` → `plan` → `apply` on `main` (manual dispatch supports `plan`/`apply`/`destroy`)            |

Repository settings to enable deployment:

| Kind     | Name                                         | Purpose                                                     |
| -------- | -------------------------------------------- | ----------------------------------------------------------- |
| Secret   | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | IAM user for Terraform and SSM deploys                      |
| Secret   | `MONGO_URI` (optional)                       | external MongoDB; omit to use the on-host container         |
| Variable | `TF_STATE_BUCKET`                            | existing S3 bucket for Terraform state (enables plan/apply) |
| Variable | `AWS_REGION` (optional, default `us-east-1`) | deployment region                                           |
| Variable | `APP_DOMAIN` (optional)                      | custom hostname; A record → `public_ip` output              |
| Variable | `DEPLOY_ENABLED` = `true`                    | turn on the deploy job once infrastructure exists           |

Also create a `production` environment (add required reviewers for a manual approval gate), and after the first image push make the `finbit-server` and `finbit-client` GHCR packages **public** so the EC2 host can pull them without credentials.

## Authentication configuration

The server environment supports these authentication settings:

| Variable                 | Default | Purpose                                      |
| ------------------------ | ------- | -------------------------------------------- |
| `JWT_ACCESS_EXPIRES_IN`  | `15m`   | Access-token lifetime                        |
| `JWT_REFRESH_EXPIRES_IN` | `7d`    | Refresh-token and cookie lifetime            |
| `BCRYPT_ROUNDS`          | `12`    | Password hashing work factor                 |
| `COOKIE_SECURE`          | `false` | Set `true` when cookies should require HTTPS |

Refresh tokens are sent only in an `httpOnly` cookie. Access tokens are held in client memory and attached to protected API requests as bearer tokens.

## Quality checks

```bash
npm test
npm run lint
npm run format:check
npm run build
```

Server tests use an isolated in-memory MongoDB instance and do not read the development database.
Client tests run in jsdom with Vitest and React Testing Library.

## Demo seed and manual

Use a disposable database whose name contains `qa`, `test`, or `demo`, then run:

```bash
SEED_RESET=true npm run seed --workspace server
```

The reset guard refuses other database names. Seed credentials and the complete verification journey
are documented in [MANUAL_QA.md](./MANUAL_QA.md).

## Repository layout

```text
.
├── client/                  # Vite + React + Tailwind CSS
├── server/                  # Express + Mongoose API
├── deploy/                  # Production docker-compose + Caddyfile
├── terraform/               # AWS infrastructure (EC2, EIP, SG, IAM)
├── .github/workflows/       # CI/CD and Terraform pipelines
├── docker-compose.yml       # Local full-stack environment
├── PROJECT_CONTEXT.md       # Running implementation and decision log
├── package.json             # npm workspaces and shared scripts
└── README.md
```
