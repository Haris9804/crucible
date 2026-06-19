# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"3Q CyberSecurity" — an ethical-hacking learning platform with four levels: learning **modules** (theory), **tests** (MCQ quizzes), hands-on **labs**, and a **CTF** final challenge. The CTF is a full-stack feature (React frontend + Express/MongoDB backend); everything else is frontend-only. There is no README; this file is the orientation.

## Commands

```bash
npm install      # install deps (frontend + backend)
npm run dev      # Vite dev server only (frontend; CTF API calls will 404)
npm run server   # CTF backend only (Express + MongoDB, port 4000) — needs MONGODB_URI
npm run dev:all  # run BOTH together (concurrently) — use this when working on the CTF
npm run smoke    # CTF backend end-to-end test against an in-memory Mongo (no Atlas needed)
npm run build    # production build to dist/
npm run preview  # serve the built dist/
npm run lint     # ESLint (flat config, eslint.config.js)
```

The CTF backend needs a MongoDB connection. Copy `.env.example` → `.env` and set `MONGODB_URI` (a MongoDB Atlas connection string) + `SESSION_SECRET`. Without `MONGODB_URI`, `npm run server` exits immediately. `npm run smoke` spins up its own in-memory MongoDB, so it needs no setup.

There is no unit-test runner. `npm test` does nothing. Note: `npm run lint` is **already red** on existing code — the strict `eslint-plugin-react-hooks` v7 rules flag pre-existing patterns (`Date.now()` purity in `TestPage`, `setState`-in-effect, etc.). The functional bar here is `npm run build` (passes) + `npm run smoke` for the backend.

## Two codebases live here — know which one you're touching

1. **The active app: a Vite + React 19 SPA.** Entry is the root `index.html` → `src/main.jsx` → `src/App.jsx` → `src/routes/AppRoutes.jsx`. This is what runs.
2. **A legacy vanilla multi-page site, preserved under `public/data/1…8/`.** Plain HTML/CSS/JS, one folder per level. The orphaned root files `old-index.html`, `script.js`, `style.css` are the legacy landing page (no longer wired to anything).

The React SPA **reuses the legacy site's JSON data** rather than its HTML. Because `public/` is Vite's static root, anything under `public/data/` is served at `/data/...` and fetched at runtime. So editing module/quiz content means editing JSON under `public/data/`, while editing how it looks/behaves means editing React under `src/`.

## React routing (`src/routes/AppRoutes.jsx`)

| Path | Page | Loads |
|------|------|-------|
| `/` | `pages/Home.jsx` | static `MODULES` array + `TestCard`/`PracticalCard`/`FinalChallengeCard` |
| `/module/:id` | `pages/ModulePage.jsx` | fetches `/data/:id/chapter{1..10}.json` (stops at first 404) |
| `/test/:id` | `pages/TestPage.jsx` | fetches `/data/6/questions/m:id.json` |
| `/labs` | `pages/LabPage.jsx` | `src/data/labsData.js` (card metadata) |
| `/labs/:labId` | `pages/IndividualLabPage.jsx` | imports `src/data/labs/lab{1..4}.json` |
| `/ctf` | `pages/ctf/CtfHomePage.jsx` | CTF backend `/api/auth/*` (admin login, team register/login) |
| `/ctf/play` | `pages/ctf/CtfPlayPage.jsx` | `/api/team/*` (team info, active CTFs, submit) |
| `/ctf/admin` | `pages/ctf/CtfAdminPage.jsx` | `/api/admin/*` (keys, teams, CTFs, results, leaderboard) |

Uses `BrowserRouter`, so production deploys need an SPA fallback rewrite to `index.html` (the `/data/*` paths are real files and resolve directly).

## Data shapes (read these before adding content)

- **Module chapters** `public/data/{id}/chapter{n}.json`: `{ chapter_title, cards: [{ title, description_short, description_long, main_points[], example }] }`. `ModulePage` switches to a **command-module** layout (command table + `activity[]`) when a card has a `main_commands` field instead of theory fields. To add a chapter, drop in the next-numbered `chapter{n}.json` — the loader probes sequentially and stops at the first gap.
- **Quiz questions** `public/data/6/questions/m{id}.json`: array of `{ question, options[], correct_option }` (`correct_option` is a 0-based index). Shared by both the legacy quiz and the React `TestPage`.
- **Labs** `src/data/labs/lab{n}.json`: `{ id, slug, title, phases: [{ id, title, subtitle, blocks[] }] }`. `blocks` are polymorphic and rendered by the recursive `renderBlock` in `IndividualLabPage.jsx`. `renderBlock` handles **only** `warning`, `requirements`, `steps`, `commands`, `links`, and `tabs` (a `tabs` block nests its own `blocks`); any other `type` falls through to `default → null` and renders nothing. Adding/enabling a block type means extending `renderBlock`.

## The CTF — full-stack feature (`server/` + `src/pages/ctf/`)

The CTF is a real Express + SQLite backend under `server/`, consumed by three React pages under `src/pages/ctf/`. `FinalChallengeCard` on the home page navigates to `/ctf`. (The old vanilla `public/data/8/` portal it replaced has been deleted.)

**Backend (`server/`, port 4000) — Express + MongoDB (native `mongodb` driver, all async):**
- `index.js` — async startup: `connect()` to Mongo → `seedIfEmpty()` → mount routes → serve `dist/` (when it exists) → listen. Sessions are stored in Mongo via `connect-mongo`. Loads `.env` through `dotenv`.
- `db.js` — `MongoClient` connection (`connect()` / `getDb()` / `getClient()`) + index creation. DB name from `MONGODB_DB` (default `ctf`).
- `seed.js` — first-run seed (admin `admin/admin123`, master key `CTF-MK-87626` + passkey toggle, two starter CTFs). Self-contained; inlined data.
- `auth.js` — bcrypt (`bcryptjs`) hashing + `requireAdmin`/`requireTeam` session guards + ID/passkey generators. (No DB access — pure helpers.)
- `store.js` — all Mongo reads + **server-side scoring** (`buildResult`) + leaderboard. Flag answers live here and are **never** sent to teams.
- `routes/{auth,team,admin}.js` — REST API under `/api/auth`, `/api/team`, `/api/admin`.

**Collections** (members and flags are *embedded*, not join tables): `admin` (one doc, `_id:'admin'`), `appKeys` (`_id:'master'|'pass'`), `teams` (`_id`=teamId, `members[]` embedded), `ctfs` (`_id`=ctfId, `flags[]` embedded), `results` (`_id`=teamId, full snapshot), `sessions` (connect-mongo).

**Security posture (hardened):** passwords bcrypt-hashed; auth is server-side Mongo-backed session cookies (`requireAdmin`/`requireTeam` guard every protected route). Flag scoring happens on the server (`/api/team/submit`); the team client never receives answers. Submission is one-time per team (`results._id` = teamId).

**Dev:** `vite.config.js` proxies `/api` → `http://localhost:4000`. Run `npm run dev:all`. The `src/api/ctfApi.js` wrapper sends `credentials: 'include'` on every call.

**Deploy / CD:** `render.yaml` is a Render Blueprint — one Node web service that builds the frontend and serves both `dist/` and the API (single origin). DB is MongoDB Atlas (free M0). Set `MONGODB_URI` in the Render dashboard; `SESSION_SECRET` is auto-generated. In production, `index.js` sets `trust proxy` + `cookie.secure` for HTTPS. Render auto-deploys **only from the `prod` branch** (`branch:` in `render.yaml`); develop on `master` and promote to `prod` (PR or fast-forward) to ship. `.github/workflows/ci.yml` runs `build` + `smoke` on pushes/PRs to `master` and `prod` — gate PRs into `prod` on it via branch protection so the deploy branch is always green.

## Conventions & state

- **Styling:** React uses CSS Modules (`src/styles/*.module.css`, imported as `styles`) plus globals (`src/styles/globals.css`, `src/index.css`, `src/App.css`). Cyberpunk/neon aesthetic throughout.
- **State:** no global store (no Redux/Context). Pages hold their own `useState`; cross-session persistence is localStorage only — e.g. `TestPage` writes `lock-{id}` (lockout after losing all lives) and `test-result-{id}`.
- ESLint rule `no-unused-vars` ignores identifiers matching `^[A-Z_]` (so unused `PascalCase`/`CONST` imports won't error).

## Known mismatches (don't "fix" without checking — they're load-bearing or stubs)

- `Home.jsx` passes `mcqPath="/quiz/1"` to `TestCard`, but `TestCard` ignores that prop and navigates to `/test/:id`. There is no `/quiz` route.
- Lab JSON contains `payloads` (lab2) and `downloads` (lab1) blocks that `renderBlock` doesn't handle, so they silently render nothing — the data is ahead of the renderer.
- The CTF backend falls back to a hardcoded dev `SESSION_SECRET` if the env var is unset (`server/index.js`); always set a real `SESSION_SECRET` in any hosted environment.
- `package.json` name is `temp-react`; this is an early-stage prototype.
