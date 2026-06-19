// Shared data access + scoring (MongoDB). Keeps query details out of the routes.
// Collections: admin, appKeys, teams (members embedded), ctfs (flags embedded), results.
import { getDb } from './db.js';

const norm = (s) => String(s ?? '').trim().toLowerCase();

// ---- Teams -------------------------------------------------------------

export async function publicTeam(teamId) {
  const db = getDb();
  const t = await db.collection('teams').findOne({ _id: teamId });
  if (!t) return null;
  const submitted = !!(await db.collection('results').findOne({ _id: teamId }, { projection: { _id: 1 } }));
  return {
    teamId: t._id,
    name: t.name,
    organisation: t.organisation,
    status: t.status,
    members: t.members || [],
    submitted,
  };
}

// ---- CTFs --------------------------------------------------------------

function publicFlag(f) {
  return { flagNum: f.flagNum, name: f.name, points: f.points, hints: f.hints || [], status: f.status };
}

function fullFlag(f) {
  return { ...publicFlag(f), answers: f.answers || [] };
}

// What a playing team sees: active CTFs, active flags only, NO answers.
export async function activeCtfsForTeam() {
  const ctfs = await getDb().collection('ctfs').find({ status: 'Active' }).sort({ _id: 1 }).toArray();
  return ctfs.map((c) => ({
    ctfId: c._id,
    name: c.name,
    instructions: c.instructions || [],
    flags: (c.flags || []).filter((f) => f.status === 'Active').map(publicFlag),
  }));
}

// Full view for admin (includes answers + inactive items).
export async function allCtfsFull() {
  const ctfs = await getDb().collection('ctfs').find({}).sort({ _id: 1 }).toArray();
  return ctfs.map((c) => ({
    ctfId: c._id,
    name: c.name,
    slug: c.slug,
    status: c.status,
    instructions: c.instructions || [],
    flags: (c.flags || []).map(fullFlag),
  }));
}

export async function ctfFull(ctfId) {
  const c = await getDb().collection('ctfs').findOne({ _id: ctfId });
  if (!c) return null;
  return {
    ctfId: c._id,
    name: c.name,
    slug: c.slug,
    status: c.status,
    instructions: c.instructions || [],
    flags: (c.flags || []).map(fullFlag),
  };
}

// ---- Scoring -----------------------------------------------------------

// responses: { [ctfId]: { [flagNum]: "submitted string" } }
// Scores server-side against the active flag set the team was shown.
export async function buildResult(teamId, responses = {}) {
  const db = getDb();
  const team = await db.collection('teams').findOne({ _id: teamId });
  const ctfs = await db.collection('ctfs').find({ status: 'Active' }).sort({ _id: 1 }).toArray();

  let totalFlags = 0;
  let allPoints = 0;
  let capturedCount = 0;
  let totalScore = 0;

  const ctfResults = ctfs.map((c) => {
    const flags = (c.flags || [])
      .filter((f) => f.status === 'Active')
      .map((f) => {
        totalFlags++;
        allPoints += f.points;

        const submitted = responses?.[c._id]?.[f.flagNum] ?? '';
        const captured = norm(submitted) !== '' && (f.answers || []).some((a) => norm(a) === norm(submitted));
        if (captured) {
          capturedCount++;
          totalScore += f.points;
        }

        return {
          flagNum: f.flagNum,
          name: f.name,
          points: f.points,
          response: captured ? 'Captured' : 'Uncaptured',
          submitted: String(submitted ?? ''),
        };
      });

    return { ctfId: c._id, ctfName: c.name, flags };
  });

  return {
    teamId,
    teamName: team.name,
    organisation: team.organisation,
    members: team.members || [],
    totalFlags,
    allPoints,
    capturedCount,
    uncapturedCount: totalFlags - capturedCount,
    totalScore,
    submittedAt: new Date().toISOString(),
    ctfs: ctfResults,
  };
}

export async function saveResult(result) {
  // _id = teamId enforces one result per team (duplicate insert throws).
  await getDb().collection('results').insertOne({ _id: result.teamId, ...result });
}

export async function getResult(teamId) {
  return getDb().collection('results').findOne({ _id: teamId });
}

export async function allResults() {
  return getDb().collection('results').find({}).sort({ totalScore: -1, submittedAt: 1 }).toArray();
}

// Ranked leaderboard: highest score first, earliest submission breaks ties.
export async function leaderboard() {
  const rows = await getDb()
    .collection('results')
    .find({}, { projection: { teamName: 1, totalScore: 1, capturedCount: 1, submittedAt: 1 } })
    .sort({ totalScore: -1, submittedAt: 1 })
    .toArray();
  return rows.map((r, i) => ({
    rank: i + 1,
    teamId: r._id,
    teamName: r.teamName,
    totalScore: r.totalScore,
    capturedCount: r.capturedCount,
    submittedAt: r.submittedAt,
  }));
}
