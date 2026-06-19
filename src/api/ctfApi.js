// Thin fetch wrapper for the CTF backend. Always sends the session cookie.
const BASE = '/api';

async function req(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json().catch(() => null);
}

export const api = {
  // ---- auth ----
  me: () => req('/auth/me'),
  adminLogin: (username, password) => req('/auth/admin/login', { method: 'POST', body: { username, password } }),
  teamRegister: (payload) => req('/auth/team/register', { method: 'POST', body: payload }),
  teamLoginPassword: (teamId, password) => req('/auth/team/login', { method: 'POST', body: { teamId, password } }),
  teamLoginPasskey: (teamId, passkey) => req('/auth/team/login', { method: 'POST', body: { teamId, passkey } }),
  logout: () => req('/auth/logout', { method: 'POST' }),

  // ---- team ----
  teamMe: () => req('/team/me'),
  teamCtfs: () => req('/team/ctfs'),
  teamSubmit: (responses) => req('/team/submit', { method: 'POST', body: { responses } }),
  teamResult: () => req('/team/result'),

  // ---- admin: keys ----
  adminKeys: () => req('/admin/keys'),
  adminPatchKey: (name, patch) => req(`/admin/keys/${name}`, { method: 'PATCH', body: patch }),
  adminRegenKey: (name) => req(`/admin/keys/${name}/regenerate`, { method: 'POST' }),
  adminPatchCreds: (patch) => req('/admin/credentials', { method: 'PATCH', body: patch }),

  // ---- admin: teams ----
  adminTeams: () => req('/admin/teams'),
  adminTeamsCount: () => req('/admin/teams/count'),
  adminFetchTeam: (v) => req(`/admin/teams/${encodeURIComponent(v)}`),
  adminDeleteTeam: (id) => req(`/admin/teams/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  adminDeleteAllTeams: () => req('/admin/teams', { method: 'DELETE' }),

  // ---- admin: ctfs / flags ----
  adminCtfs: () => req('/admin/ctfs'),
  adminPatchCtf: (id, patch) => req(`/admin/ctfs/${id}`, { method: 'PATCH', body: patch }),
  adminPatchFlag: (id, num, patch) => req(`/admin/ctfs/${id}/flags/${num}`, { method: 'PATCH', body: patch }),

  // ---- admin: results ----
  adminResults: () => req('/admin/results'),
  adminResultsCount: () => req('/admin/results/count'),
  adminFetchResult: (v) => req(`/admin/results/${encodeURIComponent(v)}`),
  adminDeleteResult: (id) => req(`/admin/results/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  adminDeleteAllResults: () => req('/admin/results', { method: 'DELETE' }),
  adminLeaderboard: () => req('/admin/leaderboard'),
};
