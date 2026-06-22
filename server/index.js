// CTF backend: Express + MongoDB, session-based auth.
// Dev:  `npm run dev:all` (Vite + this API).  Prod: serves the built dist/ too.
import 'dotenv/config'; // loads .env locally; no-op in prod where env vars are injected

console.log("MONGODB_URI =", process.env.MONGODB_URI);
console.log("MONGODB_DB =", process.env.MONGODB_DB);
console.log("SESSION_SECRET =", process.env.SESSION_SECRET);

import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { connect, getClient } from './db.js';
import { seedIfEmpty } from './seed.js';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/team.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';
const DIST = path.join(__dirname, '..', 'dist');

async function start() {
  await connect();
  await seedIfEmpty();

  const app = express();
  app.set('trust proxy', 1); // required for secure cookies behind Render's TLS proxy
  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-ctf-secret-change-me',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: getClient(),
        dbName: process.env.MONGODB_DB || 'ctf',
        collectionName: 'sessions',
      }),
      cookie: {
        httpOnly: true,
        sameSite: 'lax', // same-origin (Express serves the frontend), so lax is fine
        secure: isProd, // HTTPS-only in production
        maxAge: 1000 * 60 * 60 * 8, // 8h
      },
    })
  );

  // ---- API ----
  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Not found' }));

  // ---- Static frontend (production / whenever dist exists) ----
  if (fs.existsSync(DIST)) {
    app.use(express.static(DIST));
    app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
  }

  app.listen(PORT, () => {
    console.log(`CTF server running on http://localhost:${PORT}${isProd ? ' (production)' : ''}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
