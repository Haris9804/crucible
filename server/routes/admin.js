// Admin dashboard API: key management, team management, CTF/flag management,
// result management, leaderboard. Every route requires an admin session.
import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAdmin, hashPassword } from '../auth.js';
import {
  publicTeam, allCtfsFull, ctfFull, allResults, getResult, leaderboard,
} from '../store.js';

const router = Router();
router.use(requireAdmin);

const KEY_NAMES = ['master', 'pass'];
const randDigits = (n) => Math.floor(Math.random() * 10 ** n).toString().padStart(n, '0');

// Case-insensitive lookup of a team by _id OR name; returns the team _id or null.
async function findTeamId(value) {
  const row = await getDb()
    .collection('teams')
    .findOne(
      { $or: [{ _id: value }, { name: value }] },
      { collation: { locale: 'en', strength: 2 }, projection: { _id: 1 } }
    );
  return row?._id || null;
}

// ======================= KEY MANAGEMENT =======================

router.get('/keys', async (req, res) => {
  const db = getDb();
  const rows = await db.collection('appKeys').find({}).toArray();
  const keys = Object.fromEntries(rows.map((r) => [r._id, { value: r.value, status: r.status }]));
  const admin = await db.collection('admin').findOne({ _id: 'admin' }, { projection: { username: 1 } });
  res.json({ keys, admin: { username: admin?.username } });
});

router.patch('/keys/:name', async (req, res) => {
  const { name } = req.params;
  if (!KEY_NAMES.includes(name)) return res.status(400).json({ success: false, message: 'Unknown key' });
  const { value, status } = req.body || {};
  const set = {};
  if (value !== undefined) set.value = String(value).trim();
  if (status !== undefined) set.status = status === 'Active' ? 'Active' : 'Inactive';
  if (Object.keys(set).length) await getDb().collection('appKeys').updateOne({ _id: name }, { $set: set });
  res.json({ success: true });
});

router.post('/keys/:name/regenerate', async (req, res) => {
  const { name } = req.params;
  if (!KEY_NAMES.includes(name)) return res.status(400).json({ success: false, message: 'Unknown key' });
  const value = name === 'master' ? `CTF-MK-${randDigits(5)}` : `PK${randDigits(5)}`;
  await getDb().collection('appKeys').updateOne({ _id: name }, { $set: { value } });
  res.json({ success: true, value });
});

router.patch('/credentials', async (req, res) => {
  const { username, password } = req.body || {};
  const set = {};
  if (username) set.username = String(username).trim();
  if (password) set.passwordHash = hashPassword(password);
  if (Object.keys(set).length) await getDb().collection('admin').updateOne({ _id: 'admin' }, { $set: set });
  res.json({ success: true });
});

// ======================= TEAM MANAGEMENT =======================

router.get('/teams', async (req, res) => {
  const db = getDb();
  const teams = await db.collection('teams').find({}).sort({ createdAt: -1 }).toArray();
  const submitted = new Set(
    (await db.collection('results').find({}, { projection: { _id: 1 } }).toArray()).map((r) => r._id)
  );
  res.json(teams.map((t) => ({
    teamId: t._id,
    name: t.name,
    organisation: t.organisation,
    status: t.status,
    members: t.members || [],
    submitted: submitted.has(t._id),
    createdAt: t.createdAt,
  })));
});

router.get('/teams/count', async (req, res) => {
  res.json({ total: await getDb().collection('teams').countDocuments() });
});

router.get('/teams/:value', async (req, res) => {
  const id = await findTeamId(req.params.value);
  if (!id) return res.json(null);
  const base = await publicTeam(id);
  const t = await getDb().collection('teams').findOne({ _id: id }, { projection: { createdAt: 1 } });
  res.json(base ? { ...base, createdAt: t?.createdAt } : null);
});

router.delete('/teams/:id', async (req, res) => {
  const db = getDb();
  await db.collection('teams').deleteOne({ _id: req.params.id });
  await db.collection('results').deleteOne({ _id: req.params.id }); // cascade
  res.json({ success: true });
});

router.delete('/teams', async (req, res) => {
  const db = getDb();
  await db.collection('teams').deleteMany({});
  await db.collection('results').deleteMany({}); // cascade
  res.json({ success: true });
});

// ======================= CTF / FLAG MANAGEMENT =======================

router.get('/ctfs', async (req, res) => {
  res.json(await allCtfsFull());
});

router.get('/ctfs/:id', async (req, res) => {
  res.json(await ctfFull(req.params.id));
});

router.post('/ctfs', async (req, res) => {
  const db = getDb();
  const { ctfId, name, slug, instructions } = req.body || {};
  if (!ctfId || !name) return res.json({ success: false, message: 'ctfId and name are required' });
  if (await db.collection('ctfs').findOne({ _id: String(ctfId) }, { projection: { _id: 1 } })) {
    return res.json({ success: false, message: 'CTF ID already exists' });
  }
  await db.collection('ctfs').insertOne({
    _id: String(ctfId),
    name,
    slug: slug || `ctf${ctfId}`,
    status: 'Active',
    instructions: instructions || [],
    flags: [],
  });
  res.json({ success: true });
});

router.patch('/ctfs/:id', async (req, res) => {
  const { name, instructions, status } = req.body || {};
  const set = {};
  if (name !== undefined) set.name = name;
  if (instructions !== undefined) set.instructions = instructions;
  if (status !== undefined) set.status = status === 'Active' ? 'Active' : 'Inactive';
  const r = await getDb().collection('ctfs').updateOne({ _id: req.params.id }, { $set: set });
  if (!r.matchedCount) return res.status(404).json({ success: false, message: 'CTF not found' });
  res.json({ success: true });
});

router.delete('/ctfs/:id', async (req, res) => {
  await getDb().collection('ctfs').deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

router.post('/ctfs/:id/flags', async (req, res) => {
  const db = getDb();
  const { name, points, answers, hints } = req.body || {};
  const ctf = await db.collection('ctfs').findOne({ _id: req.params.id });
  if (!ctf) return res.status(404).json({ success: false, message: 'CTF not found' });
  const next = (ctf.flags || []).reduce((m, f) => Math.max(m, f.flagNum), 0) + 1;
  await db.collection('ctfs').updateOne(
    { _id: ctf._id },
    { $push: { flags: { flagNum: next, name: name || `Flag ${next}`, answers: answers || [], points: points || 0, hints: hints || [], status: 'Active' } } }
  );
  res.json({ success: true, flagNum: next });
});

router.patch('/ctfs/:id/flags/:num', async (req, res) => {
  const { name, points, answers, hints, status } = req.body || {};
  const set = {};
  if (name !== undefined) set['flags.$[f].name'] = name;
  if (points !== undefined) set['flags.$[f].points'] = parseInt(points, 10) || 0;
  if (answers !== undefined) set['flags.$[f].answers'] = answers;
  if (hints !== undefined) set['flags.$[f].hints'] = hints;
  if (status !== undefined) set['flags.$[f].status'] = status === 'Active' ? 'Active' : 'Inactive';
  if (!Object.keys(set).length) return res.json({ success: true });

  const r = await getDb().collection('ctfs').updateOne(
    { _id: req.params.id },
    { $set: set },
    { arrayFilters: [{ 'f.flagNum': Number(req.params.num) }] }
  );
  if (!r.matchedCount) return res.status(404).json({ success: false, message: 'Flag not found' });
  res.json({ success: true });
});

router.delete('/ctfs/:id/flags/:num', async (req, res) => {
  await getDb().collection('ctfs').updateOne(
    { _id: req.params.id },
    { $pull: { flags: { flagNum: Number(req.params.num) } } }
  );
  res.json({ success: true });
});

// ======================= RESULT MANAGEMENT =======================

router.get('/results', async (req, res) => {
  res.json(await allResults());
});

router.get('/results/count', async (req, res) => {
  res.json({ total: await getDb().collection('results').countDocuments() });
});

router.get('/results/:value', async (req, res) => {
  const id = await findTeamId(req.params.value);
  res.json(id ? await getResult(id) : null);
});

router.delete('/results/:id', async (req, res) => {
  await getDb().collection('results').deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

router.delete('/results', async (req, res) => {
  await getDb().collection('results').deleteMany({});
  res.json({ success: true });
});

// ======================= LEADERBOARD =======================

router.get('/leaderboard', async (req, res) => {
  res.json(await leaderboard());
});

export default router;
