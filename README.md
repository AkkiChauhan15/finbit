# Financial Habit Builder & Wealth Growth Tracker

Full-stack monorepo for building financial habits and tracking wealth growth. The current foundation includes secure access/refresh-token authentication and financial profile settings; the feature trackers remain placeholders.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- MongoDB running locally or a MongoDB Atlas connection string (needed when database-backed features are introduced)

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

## Demo seed and manual QA

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
├── PROJECT_CONTEXT.md       # Running implementation and decision log
├── package.json             # npm workspaces and shared scripts
└── README.md
```
