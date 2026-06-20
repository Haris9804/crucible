# Crucible

An ethical-hacking learning platform with four progressive levels:

1. **Modules** — theory lessons (chapters & cards)
2. **Tests** — multiple-choice quizzes with lives, a timer, and lockout
3. **Labs** — guided hands-on walkthroughs (lab setup, web/network vulns, tools)
4. **CTF** — a full-stack capture-the-flag final challenge (teams, flags, leaderboard)

Levels 1–3 are a frontend-only React SPA. The **CTF (level 4) is full-stack**: a React UI backed by an Express + MongoDB API.

## Tech stack

- **Frontend:** Vite + React 19, React Router, CSS Modules (cyberpunk/neon theme)
- **Backend (CTF):** Node + Express, MongoDB (native driver), `bcryptjs`, Mongo-backed sessions (`connect-mongo`)
- **Hosting:** MongoDB Atlas (database) + Render (app) — see [Deployment](#deployment)

## Quick start

**Prerequisites:** Node 20+, and a MongoDB connection (a free [Atlas](https://www.mongodb.com/cloud/atlas) cluster or a local `mongod`) for the CTF.

```bash
npm install
cp .env.example .env      # then fill in MONGODB_URI and SESSION_SECRET
npm run dev:all           # frontend (http://localhost:5173) + CTF API (http://localhost:4000)
```

Open http://localhost:5173. The learning levels work without a backend; the CTF (**Level 4 → Final Challenge**) needs the API + database.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server only (CTF API calls will 404) |
| `npm run server` | CTF backend only (Express + MongoDB, port 4000) — needs `MONGODB_URI` |
| `npm run dev:all` | Run frontend + backend together (use this for CTF work) |
| `npm run smoke` | Backend end-to-end test against an in-memory MongoDB (no setup/secrets) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run lint` | ESLint |

> Note: `npm run lint` is currently red due to strict `eslint-plugin-react-hooks` v7 rules on some pre-existing patterns. The functional gates are `npm run build` and `npm run smoke`.

## Environment

Copy `.env.example` → `.env` (gitignored) and set:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (or local `mongodb://…`) |
| `MONGODB_DB` | Database name (default `ctf`) |
| `SESSION_SECRET` | Secret used to sign session cookies — use a long random value |
| `NODE_ENV` | Set to `production` when deployed (enables secure cookies) |
| `PORT` | API port (default `4000`; Render injects this) |

## Project structure

```
src/                 React SPA
  pages/             route pages (Home, ModulePage, TestPage, Lab pages)
  pages/ctf/         CTF pages: CtfHomePage, CtfPlayPage, CtfAdminPage
  components/        shared UI
  routes/            React Router config
  api/ctfApi.js      fetch wrapper for the CTF API
  data/ , styles/    lab metadata + CSS Modules
server/              CTF backend (Express + MongoDB)
  index.js           startup, sessions, route mounting, serves dist/
  db.js  seed.js     Mongo connection + first-run seed
  auth.js  store.js  bcrypt/guards + data access & server-side scoring
  routes/            /api/auth, /api/team, /api/admin
public/data/         JSON content for modules, quizzes (and lab JSON in src/data)
```

## Routes

| Path | Page |
|---|---|
| `/` | Home (all levels) |
| `/module/:id` | Module chapters |
| `/test/:id` | Quiz |
| `/labs`, `/labs/:labId` | Labs |
| `/ctf` | CTF login / team registration |
| `/ctf/play` | Team playground |
| `/ctf/admin` | Admin dashboard |

## The CTF

A real Express + MongoDB backend (`server/`) consumed by three React pages.

- **Auth is hardened:** passwords are bcrypt-hashed, sessions are server-side (stored in Mongo), and every admin/team route is guarded. Flag answers never reach the browser.
- **Scoring is server-side:** teams submit once (`POST /api/team/submit`); the server grades and stores an immutable result.
- **Admin dashboard:** manage keys, teams, CTFs/flags, results, and the leaderboard.
- **Collections:** `admin`, `appKeys`, `teams` (members embedded), `ctfs` (flags embedded), `results`, `sessions`.

On first run the database is seeded with:

- Admin login **`admin` / `admin123`**
- Master key (team registration) **`CTF-MK-87626`**
- Two starter CTFs with flags

> ⚠️ **Security:** the seeded admin password and master key are in the source. Change the admin password (admin dashboard → Key Management) and rotate the master key before any public/event deployment, and always set a strong `SESSION_SECRET`.

## Deployment

One Node service serves both the built frontend (`dist/`) and the API; the database is MongoDB Atlas.

- **Database:** create a free **Atlas M0** cluster, a DB user, and allow network access; copy the connection string into `MONGODB_URI`.
- **App:** Render reads [`render.yaml`](./render.yaml) (Blueprint) — build `npm install && npm run build`, start `node server/index.js`. Set `MONGODB_URI` in the dashboard; `SESSION_SECRET` is generated.

### Continuous deployment

- Render auto-deploys **only from the `prod` branch**.
- Develop on `master` / feature branches; **promote to `prod`** (PR or fast-forward) to ship.
- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs `build` + `smoke` on pushes/PRs to `master` and `prod`. Gate PRs into `prod` on this check (branch protection) so the deploy branch stays green.

## Notes

This is an early-stage prototype (the `package.json` name is still `temp-react`). There is a guide for AI coding agents in [`CLAUDE.md`](./CLAUDE.md).
