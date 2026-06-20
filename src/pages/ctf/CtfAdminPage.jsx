import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/ctfApi';
import { useReveal } from '../../animations/useReveal';
import styles from '../../styles/Ctf.module.css';

export default function CtfAdminPage() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [ready, setReady] = useState(false);
  useReveal(rootRef, [ready]);

  useEffect(() => {
    api.me().then((d) => {
      if (d?.role !== 'admin') navigate('/ctf');
      else setReady(true);
    });
  }, [navigate]);

  async function logout() {
    await api.logout();
    navigate('/ctf');
  }

  if (!ready) return <div className={styles.page}>Checking access...</div>;

  return (
    <div className={styles.page} ref={rootRef}>
      <div className={styles.header}>
        <div className={styles.title} data-glitch>CTF ADMIN PORTAL</div>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={logout}>LOGOUT</button>
      </div>
      <div className={styles.wide}>
        <KeysSection />
        <TeamsSection />
        <CtfSection />
        <ResultsSection />
        <LeaderboardSection />
      </div>
    </div>
  );
}

// ============================ KEYS ============================
// Module-level so the inputs keep focus across re-renders.
function KeyRow({ title, value, setValue, status, onSave, onToggle, onRegen }) {
  return (
    <div className={styles.flagItem}>
      <div className={styles.flagTop}>
        <strong>{title}</strong>
        <span className={`${styles.badge} ${status === 'Active' ? styles.active : styles.inactive}`}>{status}</span>
      </div>
      <input className={styles.input} value={value} onChange={(e) => setValue(e.target.value)} />
      <button className={styles.btn} onClick={onSave}>SAVE</button>
      <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onToggle}>
        {status === 'Active' ? 'DEACTIVATE' : 'ACTIVATE'}
      </button>
      <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onRegen}>REGENERATE</button>
    </div>
  );
}

function KeysSection() {
  const [data, setData] = useState(null);
  const [master, setMaster] = useState('');
  const [pass, setPass] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  async function load() {
    const d = await api.adminKeys();
    setData(d);
    setMaster(d?.keys?.master?.value || '');
    setPass(d?.keys?.pass?.value || '');
    setUsername(d?.admin?.username || '');
  }
  useEffect(() => { load(); }, []);

  if (!data) return null;

  const patchKey = (name, patch) => api.adminPatchKey(name, patch).then(load);

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>// KEY MANAGEMENT</div>

      <KeyRow
        title="Master Key"
        value={master}
        setValue={setMaster}
        status={data.keys.master.status}
        onSave={() => patchKey('master', { value: master })}
        onToggle={() => patchKey('master', { status: data.keys.master.status === 'Active' ? 'Inactive' : 'Active' })}
        onRegen={() => api.adminRegenKey('master').then(load)}
      />

      <KeyRow
        title="Passkey Login Toggle"
        value={pass}
        setValue={setPass}
        status={data.keys.pass.status}
        onSave={() => patchKey('pass', { value: pass })}
        onToggle={() => patchKey('pass', { status: data.keys.pass.status === 'Active' ? 'Inactive' : 'Active' })}
        onRegen={() => api.adminRegenKey('pass').then(load)}
      />

      <div className={styles.flagItem}>
        <strong>Admin Credentials</strong>
        <label className={styles.label}>Username</label>
        <input className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} />
        <label className={styles.label}>New Password (leave blank to keep)</label>
        <input className={styles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button className={styles.btn} onClick={async () => {
          await api.adminPatchCreds({ username, ...(newPassword ? { password: newPassword } : {}) });
          setNewPassword('');
          load();
        }}>UPDATE CREDENTIALS</button>
      </div>
    </div>
  );
}

// ============================ TEAMS ============================
function TeamsSection() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [info, setInfo] = useState('');

  async function load() {
    setInfo('');
    const d = await api.adminTeams();
    setTeams(Array.isArray(d) ? d : []);
  }
  useEffect(() => { load(); }, []);

  async function doSearch() {
    if (!search.trim()) return load();
    const t = await api.adminFetchTeam(search.trim());
    setTeams(t ? [t] : []);
    if (!t) setInfo('No team found');
  }

  async function remove(id) {
    if (!window.confirm(`Delete team ${id}?`)) return;
    await api.adminDeleteTeam(id);
    load();
  }

  async function removeAll() {
    if (!window.confirm('Remove ALL teams? This cannot be undone.')) return;
    await api.adminDeleteAllTeams();
    load();
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>// TEAM MANAGEMENT ({teams.length})</div>
      <div className={styles.row}>
        <input className={styles.input} placeholder="Team ID or name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className={styles.btn} onClick={doSearch}>FETCH</button>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={load}>REFRESH</button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={removeAll}>REMOVE ALL</button>
      </div>
      <div className={styles.msg}>{info}</div>

      <div className={styles.scroll}>
        {teams.map((t) => (
          <div key={t.teamId} className={styles.flagItem}>
            <div className={styles.flagTop}>
              <strong>{t.name}</strong>
              <span>{t.submitted ? 'Submitted' : 'Not submitted'}</span>
            </div>
            <div className={styles.kv}>
              <div><strong>ID:</strong> {t.teamId}</div>
              <div><strong>Org:</strong> {t.organisation || '—'}</div>
              <div><strong>Status:</strong> {t.status}</div>
              {t.members.map((m, i) => <div key={i}>· {m.name} — {m.profession} ({m.gender})</div>)}
            </div>
            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => remove(t.teamId)}>DELETE</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================ CTFs / FLAGS ============================
function CtfSection() {
  const [ctfs, setCtfs] = useState([]);

  async function load() {
    const d = await api.adminCtfs();
    setCtfs(Array.isArray(d) ? d : []);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>// CTF MANAGEMENT</div>
      <NewCtfForm reload={load} />
      {ctfs.map((ctf) => (
        <CtfCard key={ctf.ctfId} ctf={ctf} reload={load} />
      ))}
    </div>
  );
}

function NewCtfForm({ reload }) {
  const [open, setOpen] = useState(false);
  const [ctfId, setCtfId] = useState('');
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [err, setErr] = useState('');

  async function create() {
    setErr('');
    if (!ctfId.trim() || !name.trim()) { setErr('CTF ID and name are required'); return; }
    const d = await api.adminCreateCtf({
      ctfId: ctfId.trim(),
      name: name.trim(),
      instructions: instructions.split('\n').map((s) => s.trim()).filter(Boolean),
    });
    if (d?.success === false) { setErr(d.message || 'Could not create CTF'); return; }
    setCtfId(''); setName(''); setInstructions(''); setOpen(false);
    reload();
  }

  if (!open) {
    return <button className={styles.btn} onClick={() => setOpen(true)}>+ NEW CTF</button>;
  }
  return (
    <div className={styles.flagItem}>
      <strong>New CTF</strong>
      <label className={styles.label}>CTF ID (e.g. 10003)</label>
      <input className={styles.input} value={ctfId} onChange={(e) => setCtfId(e.target.value)} />
      <label className={styles.label}>Name</label>
      <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
      <label className={styles.label}>Instructions (one per line)</label>
      <textarea className={styles.textarea} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
      <button className={styles.btn} onClick={create}>CREATE</button>
      <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setOpen(false); setErr(''); }}>CANCEL</button>
      <div className={`${styles.msg} ${styles.msgError}`}>{err}</div>
    </div>
  );
}

function CtfCard({ ctf, reload }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(ctf.name);
  const [instructions, setInstructions] = useState((ctf.instructions || []).join('\n'));

  async function saveMeta() {
    await api.adminPatchCtf(ctf.ctfId, {
      name: name.trim(),
      instructions: instructions.split('\n').map((s) => s.trim()).filter(Boolean),
    });
    setEditing(false);
    reload();
  }

  async function remove() {
    if (!window.confirm(`Delete CTF "${ctf.name}" and all its flags?`)) return;
    await api.adminDeleteCtf(ctf.ctfId);
    reload();
  }

  async function addFlag() {
    await api.adminAddFlag(ctf.ctfId, { name: 'New flag', points: 0, answers: [], hints: [] });
    reload();
  }

  async function moveFlag(flagNum, dir) {
    const nums = ctf.flags.map((f) => f.flagNum);
    const i = nums.indexOf(flagNum);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= nums.length) return;
    [nums[i], nums[j]] = [nums[j], nums[i]];
    await api.adminReorderFlags(ctf.ctfId, nums);
    reload();
  }

  return (
    <div className={styles.ctfBox}>
      <div className={styles.ctfHeading}>
        <span className={styles.ctfName}>{ctf.name} (#{ctf.ctfId})</span>
        <span className={`${styles.badge} ${ctf.status === 'Active' ? styles.active : styles.inactive}`}>{ctf.status}</span>
      </div>

      {editing ? (
        <div className={styles.flagItem}>
          <label className={styles.label}>Name</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
          <label className={styles.label}>Instructions (one per line)</label>
          <textarea className={styles.textarea} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          <button className={styles.btn} onClick={saveMeta}>SAVE</button>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setEditing(false)}>CANCEL</button>
        </div>
      ) : (
        <>
          {(ctf.instructions || []).length > 0 && (
            <div className={styles.muted}>{ctf.instructions.join(' · ')}</div>
          )}
          <div className={styles.row}>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setEditing(true)}>EDIT CTF</button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={async () => {
              await api.adminPatchCtf(ctf.ctfId, { status: ctf.status === 'Active' ? 'Inactive' : 'Active' });
              reload();
            }}>
              {ctf.status === 'Active' ? 'DEACTIVATE CTF' : 'ACTIVATE CTF'}
            </button>
            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={remove}>DELETE CTF</button>
          </div>
        </>
      )}

      {ctf.flags.map((f, i) => (
        <FlagRow
          key={f.flagNum}
          ctfId={ctf.ctfId}
          flag={f}
          reload={reload}
          isFirst={i === 0}
          isLast={i === ctf.flags.length - 1}
          onMove={moveFlag}
        />
      ))}
      <button className={styles.btn} onClick={addFlag}>+ ADD FLAG</button>
    </div>
  );
}

function FlagRow({ ctfId, flag, reload, isFirst, isLast, onMove }) {
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [name, setName] = useState(flag.name);
  const [points, setPoints] = useState(flag.points);
  const [answers, setAnswers] = useState((flag.answers || []).join('\n'));
  const [hints, setHints] = useState((flag.hints || []).join('\n'));
  const [err, setErr] = useState('');

  async function save() {
    const ans = answers.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!name.trim()) { setErr('Name is required'); return; }
    if (ans.length === 0) { setErr('At least one answer is required'); return; }
    await api.adminPatchFlag(ctfId, flag.flagNum, {
      name: name.trim(),
      points: parseInt(points, 10) || 0,
      answers: ans,
      hints: hints.split('\n').map((s) => s.trim()).filter(Boolean),
    });
    setErr(''); setEditing(false);
    reload();
  }

  async function remove() {
    if (!window.confirm(`Delete Flag ${flag.flagNum} (${flag.name})?`)) return;
    await api.adminDeleteFlag(ctfId, flag.flagNum);
    reload();
  }

  return (
    <div className={styles.flagItem}>
      <div className={styles.flagTop}>
        <span>Flag {flag.flagNum} — {flag.name}</span>
        <span className={`${styles.badge} ${flag.status === 'Active' ? styles.active : styles.inactive}`}>{flag.status}</span>
      </div>

      {!editing ? (
        <div className={styles.kv}>
          <div><strong>Points:</strong> {flag.points}</div>
          <div><strong>Answers:</strong> {(flag.answers || []).join(', ') || '—'}</div>
          <div className={styles.muted}>{(flag.hints || []).join(' · ')}</div>

          <div className={styles.row}>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setEditing(true)}>EDIT</button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={async () => {
              await api.adminPatchFlag(ctfId, flag.flagNum, { status: flag.status === 'Active' ? 'Inactive' : 'Active' });
              reload();
            }}>
              {flag.status === 'Active' ? 'DEACTIVATE' : 'ACTIVATE'}
            </button>
            <button className={`${styles.btn} ${styles.btnGhost}`} disabled={isFirst} onClick={() => onMove(flag.flagNum, 'up')}>▲</button>
            <button className={`${styles.btn} ${styles.btnGhost}`} disabled={isLast} onClick={() => onMove(flag.flagNum, 'down')}>▼</button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setPreview((p) => !p)}>{preview ? 'HIDE' : 'PREVIEW'}</button>
            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={remove}>DELETE</button>
          </div>

          {preview && <FlagPreview flag={flag} />}
        </div>
      ) : (
        <div>
          <label className={styles.label}>Name</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
          <label className={styles.label}>Points</label>
          <input className={styles.input} type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
          <label className={styles.label}>Answers (one per line) — matched case-insensitively</label>
          <textarea className={styles.textarea} value={answers} onChange={(e) => setAnswers(e.target.value)} />
          <label className={styles.label}>Hints (one per line)</label>
          <textarea className={styles.textarea} value={hints} onChange={(e) => setHints(e.target.value)} />
          <button className={styles.btn} onClick={save}>SAVE</button>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setEditing(false); setErr(''); }}>CANCEL</button>
          <div className={`${styles.msg} ${styles.msgError}`}>{err}</div>
        </div>
      )}
    </div>
  );
}

// Live preview: how the flag appears to a team on the play page.
function FlagPreview({ flag }) {
  return (
    <div className={styles.flagItem} style={{ borderStyle: 'dashed' }}>
      <div className={styles.muted}>// TEAM VIEW PREVIEW</div>
      <div className={styles.flagTop}>
        <span>Flag {flag.flagNum} — {flag.name}</span>
        <span className={styles.flagPts}>{flag.points} pts</span>
      </div>
      <input className={styles.input} placeholder="Enter flag" disabled />
      {(flag.hints || []).length > 0 && (
        <div className={styles.hint}>{flag.hints.map((h, i) => <div key={i}>• {h}</div>)}</div>
      )}
    </div>
  );
}

// ============================ RESULTS ============================
function ResultsSection() {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState('');
  const [info, setInfo] = useState('');

  async function load() {
    setInfo('');
    const d = await api.adminResults();
    setResults(Array.isArray(d) ? d : []);
  }
  useEffect(() => { load(); }, []);

  async function doSearch() {
    if (!search.trim()) return load();
    const r = await api.adminFetchResult(search.trim());
    setResults(r ? [r] : []);
    if (!r) setInfo('No result found');
  }

  async function remove(id) {
    if (!window.confirm(`Delete result for ${id}?`)) return;
    await api.adminDeleteResult(id);
    load();
  }

  async function removeAll() {
    if (!window.confirm('Remove ALL results?')) return;
    await api.adminDeleteAllResults();
    load();
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>// RESULT MANAGEMENT ({results.length})</div>
      <div className={styles.row}>
        <input className={styles.input} placeholder="Team ID or name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className={styles.btn} onClick={doSearch}>FETCH</button>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={load}>REFRESH</button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={removeAll}>REMOVE ALL</button>
      </div>
      <div className={styles.msg}>{info}</div>

      <div className={styles.scroll}>
        {results.map((r) => (
          <div key={r.teamId} className={styles.flagItem}>
            <div className={styles.flagTop}>
              <strong>{r.teamName}</strong>
              <span>Score: {r.totalScore}</span>
            </div>
            <div className={styles.kv}>
              <div><strong>ID:</strong> {r.teamId}</div>
              <div><strong>Captured:</strong> {r.capturedCount} / {r.totalFlags}</div>
              <div><strong>Submitted:</strong> {new Date(r.submittedAt).toLocaleString()}</div>
            </div>
            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => remove(r.teamId)}>DELETE</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================ LEADERBOARD ============================
function LeaderboardSection() {
  const [rows, setRows] = useState([]);

  async function load() {
    const d = await api.adminLeaderboard();
    setRows(Array.isArray(d) ? d : []);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>// LEADERBOARD</div>
      <button className={`${styles.btn} ${styles.btnGhost}`} onClick={load}>REFRESH</button>
      <table className={styles.table}>
        <thead>
          <tr><th>Rank</th><th>Team</th><th>ID</th><th>Score</th><th>Captured</th><th>Submitted</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.teamId}>
              <td>{r.rank}</td>
              <td>{r.teamName}</td>
              <td>{r.teamId}</td>
              <td>{r.totalScore}</td>
              <td>{r.capturedCount}</td>
              <td>{new Date(r.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
