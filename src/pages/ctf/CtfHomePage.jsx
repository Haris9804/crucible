import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/ctfApi';
import styles from '../../styles/Ctf.module.css';

const EMPTY_MEMBER = { name: '', profession: '', gender: '' };

export default function CtfHomePage() {
  const navigate = useNavigate();

  // already logged in? jump straight to the right place
  useEffect(() => {
    api.me().then((d) => {
      if (d?.role === 'admin') navigate('/ctf/admin');
      else if (d?.role === 'team') navigate('/ctf/play');
    });
  }, [navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>CTF CHALLENGE PORTAL</div>
          <div className={styles.subtitle}>Welcome to the final challenge.</div>
        </div>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => navigate('/')}>
          ← HOME
        </button>
      </div>

      <div className={styles.grid}>
        <AdminLogin onDone={() => navigate('/ctf/admin')} />
        <TeamPanel onLoggedIn={() => navigate('/ctf/play')} />
      </div>
    </div>
  );
}

// ============================ ADMIN ============================
function AdminLogin({ onDone }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function submit() {
    setMsg('');
    const d = await api.adminLogin(username, password);
    if (d?.success) onDone();
    else setMsg(d?.message || 'Login failed');
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>// ADMIN LOGIN</div>
      <label className={styles.label}>Admin Username</label>
      <input className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} />
      <label className={styles.label}>Admin Password</label>
      <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className={styles.btn} onClick={submit}>LOGIN</button>
      <div className={`${styles.msg} ${styles.msgError}`}>{msg}</div>
    </div>
  );
}

// ============================ TEAM ============================
function TeamPanel({ onLoggedIn }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>// TEAM ACCESS</div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`} onClick={() => setMode('login')}>
          Login
        </button>
        <button className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`} onClick={() => setMode('register')}>
          Register
        </button>
      </div>
      {mode === 'login' ? <TeamLogin onLoggedIn={onLoggedIn} /> : <TeamRegister />}
    </div>
  );
}

function TeamLogin({ onLoggedIn }) {
  const [method, setMethod] = useState('password'); // 'password' | 'passkey'
  const [teamId, setTeamId] = useState('');
  const [secret, setSecret] = useState('');
  const [msg, setMsg] = useState('');

  async function submit() {
    setMsg('');
    const d = method === 'password'
      ? await api.teamLoginPassword(teamId, secret)
      : await api.teamLoginPasskey(teamId, secret);
    if (d?.success) onLoggedIn();
    else setMsg(d?.message || 'Login failed');
  }

  return (
    <>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${method === 'password' ? styles.active : ''}`} onClick={() => { setMethod('password'); setSecret(''); }}>
          Password
        </button>
        <button className={`${styles.tab} ${method === 'passkey' ? styles.active : ''}`} onClick={() => { setMethod('passkey'); setSecret(''); }}>
          Passkey
        </button>
      </div>
      <label className={styles.label}>Team ID</label>
      <input className={styles.input} value={teamId} onChange={(e) => setTeamId(e.target.value)} />
      <label className={styles.label}>{method === 'password' ? 'Team Password' : 'Passkey'}</label>
      <input
        className={styles.input}
        type={method === 'password' ? 'password' : 'text'}
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
      />
      <button className={styles.btn} onClick={submit}>LOGIN</button>
      <div className={`${styles.msg} ${styles.msgError}`}>{msg}</div>
    </>
  );
}

function TeamRegister() {
  const [teamName, setTeamName] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [members, setMembers] = useState([{ ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }]);
  const [msg, setMsg] = useState('');
  const [created, setCreated] = useState(null); // { teamId, passkey }

  function setMember(i, field, value) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }

  async function submit() {
    setMsg('');
    const d = await api.teamRegister({ teamName, teamPassword, orgName, masterKey, members });
    if (d?.success) setCreated({ teamId: d.teamId, passkey: d.passkey });
    else setMsg(d?.message || 'Registration failed');
  }

  if (created) {
    return (
      <div>
        <div className={styles.msgOk} style={{ marginBottom: 8 }}>Team created successfully!</div>
        <div className={styles.kv}>
          <div><strong>Team ID:</strong></div>
          <div className={styles.idDisplay}>{created.teamId}</div>
          <div><strong>Passkey:</strong></div>
          <div className={styles.idDisplay}>{created.passkey}</div>
        </div>
        <div className={styles.muted}>Save these now — the passkey is shown only once.</div>
        <button
          className={styles.btn}
          onClick={() => navigator.clipboard?.writeText(`Team ID: ${created.teamId}\nPasskey: ${created.passkey}`)}
        >
          COPY
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className={styles.label}>Team Name</label>
      <input className={styles.input} value={teamName} onChange={(e) => setTeamName(e.target.value)} />
      <label className={styles.label}>Team Password</label>
      <input className={styles.input} type="password" value={teamPassword} onChange={(e) => setTeamPassword(e.target.value)} />
      <label className={styles.label}>Organisation</label>
      <input className={styles.input} value={orgName} onChange={(e) => setOrgName(e.target.value)} />

      {members.map((m, i) => (
        <div key={i} style={{ marginTop: 10 }}>
          <label className={styles.label}>
            Member {i + 1} {i < 2 ? '(required)' : '(optional)'}
          </label>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Name" value={m.name} onChange={(e) => setMember(i, 'name', e.target.value)} />
            <input className={styles.input} placeholder="Profession" value={m.profession} onChange={(e) => setMember(i, 'profession', e.target.value)} />
            <select className={styles.select} value={m.gender} onChange={(e) => setMember(i, 'gender', e.target.value)}>
              <option value="">Gender</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
        </div>
      ))}

      <label className={styles.label}>Master Key</label>
      <input className={styles.input} value={masterKey} onChange={(e) => setMasterKey(e.target.value)} />

      <button className={styles.btn} onClick={submit}>CREATE TEAM</button>
      <div className={`${styles.msg} ${styles.msgError}`}>{msg}</div>
    </div>
  );
}
