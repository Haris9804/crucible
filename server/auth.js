// Auth helpers: bcrypt hashing + session-based route guards.
import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export const hashPassword = (plain) => bcrypt.hashSync(plain, ROUNDS);
export const verifyPassword = (plain, hash) => bcrypt.compareSync(plain, hash);

// Short, human-friendly random identifiers (no ambiguous chars).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function randomCode(len) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export const generateTeamId = () => `TEAM-${randomCode(5)}`;
export const generatePasskey = () => `PK-${randomCode(6)}`;

export function requireAdmin(req, res, next) {
  if (req.session?.role === 'admin') return next();
  return res.status(401).json({ success: false, message: 'Admin authentication required' });
}

export function requireTeam(req, res, next) {
  if (req.session?.role === 'team' && req.session.teamId) return next();
  return res.status(401).json({ success: false, message: 'Team authentication required' });
}
