// End-to-end smoke test against an in-memory MongoDB (no Atlas needed).
// Run: npm run smoke
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri();
process.env.MONGODB_DB = 'ctf';
process.env.PORT = '4555';
delete process.env.NODE_ENV; // keep cookies non-secure for plain-HTTP test

await import('./index.js'); // boots the server (connect → seed → listen)

const B = 'http://localhost:4555';
let passed = 0;
let failed = 0;

function check(name, cond) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}`); }
}

const cookieOf = (res) => {
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
  return sc.map((c) => c.split(';')[0]).join('; ');
};

const call = (path, { method = 'GET', body, cookie } = {}) =>
  fetch(B + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

async function waitForHealth() {
  for (let i = 0; i < 40; i++) {
    try { if ((await call('/api/health')).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server did not become healthy');
}

try {
  await waitForHealth();
  console.log('\nRunning CTF smoke test (in-memory Mongo)\n');

  // 1. admin login
  let res = await call('/api/auth/admin/login', { method: 'POST', body: { username: 'admin', password: 'admin123' } });
  const adminCookie = cookieOf(res);
  check('admin login succeeds', (await res.json()).success === true);

  // 2. admin keys: master Active, no password leaked
  res = await call('/api/admin/keys', { cookie: adminCookie });
  const keys = await res.json();
  check('master key seeded Active', keys.keys?.master?.status === 'Active');
  check('admin password not exposed', keys.admin && keys.admin.passwordHash === undefined);

  // 3. register team
  res = await call('/api/auth/team/register', {
    method: 'POST',
    body: {
      teamName: 'Smoke Team', teamPassword: 'pw123', orgName: 'QA', masterKey: 'CTF-MK-87626',
      members: [{ name: 'Alice', profession: 'Dev', gender: 'F' }, { name: 'Bob', profession: 'Ops', gender: 'M' }],
    },
  });
  const reg = await res.json();
  check('team registration succeeds', reg.success === true && /^TEAM-/.test(reg.teamId));
  check('passkey returned at registration', /^PK-/.test(reg.passkey || ''));
  const teamId = reg.teamId;

  // 4. wrong master key rejected
  res = await call('/api/auth/team/register', {
    method: 'POST',
    body: { teamName: 'X', teamPassword: 'y', masterKey: 'WRONG', members: [{ name: 'a' }, { name: 'b' }] },
  });
  check('bad master key rejected', (await res.json()).success === false);

  // 5. team login (password)
  res = await call('/api/auth/team/login', { method: 'POST', body: { teamId, password: 'pw123' } });
  const teamCookie = cookieOf(res);
  check('team password login succeeds', (await res.json()).success === true);

  // 6. team ctfs — answers must be stripped
  res = await call('/api/team/ctfs', { cookie: teamCookie });
  const ctfs = (await res.json()).ctfs;
  const anyAnswers = ctfs.some((c) => c.flags.some((f) => 'answers' in f));
  check('team sees CTFs', ctfs.length === 2);
  check('answers stripped from team payload', anyAnswers === false);

  // 7. submit (1 correct of 9) → score 25
  res = await call('/api/team/submit', { method: 'POST', cookie: teamCookie, body: { responses: { 10001: { 1: '192.168.1.11', 2: 'nope' } } } });
  const sub = await res.json();
  check('submit succeeds', sub.success === true);
  check('server scored 1 captured', sub.result?.capturedCount === 1);
  check('server total score = 25', sub.result?.totalScore === 25);
  check('total flags counted = 9', sub.result?.totalFlags === 9);

  // 8. second submit rejected (one-time)
  res = await call('/api/team/submit', { method: 'POST', cookie: teamCookie, body: { responses: {} } });
  check('duplicate submit rejected', (await res.json()).success === false);

  // 9. leaderboard reflects the team
  res = await call('/api/admin/leaderboard', { cookie: adminCookie });
  const lb = await res.json();
  check('leaderboard ranks the team', lb[0]?.teamId === teamId && lb[0]?.totalScore === 25);

  // 10. unauthenticated admin call is blocked
  res = await call('/api/admin/keys');
  check('unauthenticated admin call → 401', res.status === 401);

  // 11. admin can delete the result (cascade-style cleanup) then team can play again
  await call(`/api/admin/results/${teamId}`, { method: 'DELETE', cookie: adminCookie });
  res = await call('/api/team/result', { cookie: teamCookie });
  check('result cleared by admin', (await res.json()).found === false);

  console.log(`\n${failed === 0 ? 'ALL PASSED' : 'FAILURES'}: ${passed} passed, ${failed} failed\n`);
} catch (err) {
  console.error('Smoke test error:', err);
  failed++;
} finally {
  await mongod.stop();
  process.exit(failed === 0 ? 0 : 1);
}
