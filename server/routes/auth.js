// Authentication: admin login, team registration, team login (password or
// passkey), logout, and session introspection.
import { Router } from 'express';
import { getDb } from '../db.js';
import {
  hashPassword, verifyPassword, generateTeamId, generatePasskey,
} from '../auth.js';
import { publicTeam } from '../store.js';

const router = Router();

// ---- Admin login -------------------------------------------------------
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  const admin = await getDb().collection('admin').findOne({ _id: 'admin' });
  if (!admin || admin.username !== username || !verifyPassword(password || '', admin.passwordHash)) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
  req.session.role = 'admin';
  res.json({ success: true });
});

// ---- Team registration -------------------------------------------------
router.post('/team/register', async (req, res) => {
  const db = getDb();
  const { teamName, teamPassword, orgName, members, masterKey } = req.body || {};

  if (!teamName || !teamPassword) {
    return res.json({ success: false, message: 'Team name and password are required' });
  }

  const master = await db.collection('appKeys').findOne({ _id: 'master' });
  if (!master || master.status !== 'Active' || master.value !== (masterKey || '').trim()) {
    return res.json({ success: false, message: 'Invalid or inactive master key' });
  }

  // Require at least the two mandatory members.
  const cleanMembers = (members || [])
    .map((m) => ({
      name: (m?.name || '').trim(),
      profession: (m?.profession || '').trim(),
      gender: (m?.gender || '').trim(),
    }))
    .filter((m) => m.name !== '');

  if (cleanMembers.length < 2) {
    return res.json({ success: false, message: 'At least two members are required' });
  }

  const teamId = generateTeamId();
  const passkey = generatePasskey();

  await db.collection('teams').insertOne({
    _id: teamId,
    name: teamName.trim(),
    passwordHash: hashPassword(teamPassword),
    organisation: (orgName || '').trim(),
    status: 'Active',
    passkey,
    createdAt: new Date().toISOString(),
    members: cleanMembers,
  });

  // Return the passkey ONCE at registration (it is the team's alternate login).
  res.json({ success: true, teamId, passkey });
});

// ---- Team login (password or passkey) ----------------------------------
router.post('/team/login', async (req, res) => {
  const db = getDb();
  const { teamId, password, passkey } = req.body || {};
  const team = await db.collection('teams').findOne({ _id: (teamId || '').trim() });
  if (!team) return res.json({ success: false, message: 'Team not found' });

  if (passkey !== undefined) {
    const toggle = await db.collection('appKeys').findOne({ _id: 'pass' });
    if (!toggle || toggle.status !== 'Active') {
      return res.json({ success: false, message: 'Passkey login is disabled' });
    }
    if (team.passkey !== (passkey || '').trim()) {
      return res.json({ success: false, message: 'Invalid passkey' });
    }
  } else if (!verifyPassword(password || '', team.passwordHash)) {
    return res.json({ success: false, message: 'Invalid team credentials' });
  }

  req.session.role = 'team';
  req.session.teamId = team._id;
  res.json({ success: true, teamId: team._id });
});

// ---- Logout ------------------------------------------------------------
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ---- Session info ------------------------------------------------------
router.get('/me', async (req, res) => {
  if (req.session?.role === 'admin') return res.json({ role: 'admin' });
  if (req.session?.role === 'team' && req.session.teamId) {
    return res.json({ role: 'team', team: await publicTeam(req.session.teamId) });
  }
  res.json({ role: null });
});

export default router;
