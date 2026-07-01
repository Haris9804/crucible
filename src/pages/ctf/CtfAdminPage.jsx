import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/ctfApi';
import { useReveal } from '../../animations/useReveal';
import styles from '../../styles/CtfAdmin.module.css';

import CyberButton from "../../components/CyberButton";
import PlayIcon from "../../components/Icons/PlayIcon";

export default function CtfAdminPage() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [activeSection, setActiveSection]=useState("teams");

  const [teams, setTeams] = useState([]);
  const [ctfs, setCtfs] = useState([]);
  const [results, setResults] = useState([]);
  const [rows, setRows] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(true);

  useReveal(rootRef, [ready]);
  
  useEffect(() => {
    api.me().then((d) => {
      if (d?.role !== 'admin') navigate('/ctf');
      else setReady(true);
    });
  }, [navigate]);

  useEffect(() => {
  async function loadStats() {
    const t = await api.adminTeams();
    setTeams(Array.isArray(t) ? t : []);

    const c = await api.adminCtfs();
    setCtfs(Array.isArray(c) ? c : []);

    const r = await api.adminResults();
    setResults(Array.isArray(r) ? r : []);

    const l = await api.adminLeaderboard();
    setRows(Array.isArray(l) ? l : []);
  }

  loadStats();
}, []);

  async function logout() {
    await api.logout();
    navigate('/ctf');
  }

  if (!ready) return <div className={styles.page}>Checking access...</div>;

  const workspace = {

keys:{
title:"KEY MANAGEMENT"
},

teams:{
title:"TEAM MANAGEMENT"
},

ctfs:{
title:"CTF MANAGEMENT"
},

results:{
title:"RESULT MANAGEMENT"
},

leaderboard:{
title:"LEADERBOARD"
}

};

const workspaceTitle = workspace[activeSection].title;

const workspacePath = workspace[activeSection].path;

  
function renderActions() {
  switch (activeSection) {

    case "keys":
      return (
        <>
          
        </>
      );

    case "teams":
      return null;

      return (
        <>
          <input
            className={styles.input}
            placeholder="Team ID or Name"
          />

          <button className={styles.btn}>
            FETCH
          </button>

          <button className={`${styles.btn} ${styles.btnGhost}`}>
            REFRESH
          </button>

          <button className={`${styles.btn} ${styles.btnDanger}`}>
            REMOVE ALL
          </button>
        </>
      );

    case "ctfs":
      return null;

    case "results":
      return null;

    case "leaderboard":
      return (
        <>
          <button className={`${styles.btn} ${styles.btnGhost}`}>
            REFRESH
          </button>
        </>
      );

    default:
      return null;
  }
}

<div
        className={[
         styles.sidebarOverlay,
         sidebarOpen ? styles.active : ""
        ].join(" ")}
        onClick={() => setSidebarOpen(false)}
      />

  return (
    <div className={styles.page} ref={rootRef}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.title} data-glitch>CTF ADMIN PORTAL</div>
        </div>
        <div className={styles.headerRight}>

          <button
  className={styles.menuBtn}
  onClick={() => setSidebarOpen(true)}
>
  ☰
</button>
          <div className={styles.liveChip}>
            <div className={styles.liveDot}></div>
            ADMIN ACTIVE
          </div>
            
          <CyberButton
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={logout}
              icon={
                <PlayIcon
                  style={{
                    transform: "rotate(180deg)"
                  }}
                />
              }
           >
           LOGOUT
          </CyberButton>
        </div>
        
      </div>


      <div className={styles.statsPanel}>
        <div
        className={styles.statsHeader}
        onClick={() => setStatsOpen(!statsOpen)}
    >
        <span>SYSTEM OVERVIEW</span>

        <span className={styles.statsArrow}>
            {statsOpen ? "▲" : "▼"}
        </span>
    </div>
    {statsOpen &&(
      <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.greenCard}`}>
    <div className={styles.statIcon}>
      ◈
    </div>

    <div className={styles.statInfo}>
      <div className={styles.statValue}>
        {teams.length}
      </div>

      <div className={styles.statLabel}>
        TEAMS
      </div>

      <div className={styles.statSub}>
        Registered Teams
      </div>
    </div>
  </div>


  <div className={`${styles.statCard} ${styles.blueCard}`}>
    <div className={styles.statIcon}>
      ⚑
    </div>

    <div className={styles.statInfo}>
      <div className={styles.statValue}>
        {ctfs.filter(c => c.status === "Active").length}
      </div>

      <div className={styles.statLabel}>
        ACTIVE CTFs
      </div>

      <div className={styles.statSub}>
        Challenges
      </div>
    </div>
  </div>


  <div className={`${styles.statCard} ${styles.amberCard}`}>
    <div className={styles.statIcon}>
      ▣
    </div>

    <div className={styles.statInfo}>
      <div className={styles.statValue}>
        {results.length}
      </div>

      <div className={styles.statLabel}>
        RESULTS
      </div>

      <div className={styles.statSub}>
        Submissions
      </div>
    </div>
  </div>


  <div className={`${styles.statCard} ${styles.purpleCard}`}>
    <div className={styles.statIcon}>
      ★ 
    </div>

    <div className={styles.statInfo}>
      <div className={styles.statValue}>
        {rows[0]?.totalScore || 0}
      </div>

      <div className={styles.statLabel}>
        TOP SCORE
      </div>

      <div className={styles.statSub}>
        Highest Team
      </div>
    </div>
  </div>
      </div>
    )}
      </div>
      

      <div className={styles.dashboardBody}>

<aside
  className={[
    styles.sidebar,
    sidebarOpen ? styles.open : ""
  ].join(" ")}
>

  <div className={styles.sbHead}>
    // SECTIONS
    <div className={styles.sbHeadDot}></div>
  </div>

  <div className={styles.navScroll}>

    {/* KEYS */}
    <button
      className={`${styles.sideBtn} ${
        activeSection === "keys" ? styles.activeSection : ""
      }`}
      onClick={() => {
    setActiveSection("keys");
    setSidebarOpen(false);
}}
     
    >
      <div className={styles.navIconBox}>🔑</div>

      <div className={styles.navTxt}>
        <div className={styles.navLbl}>KEY MANAGEMENT</div>
      </div>
    </button>

    {/* TEAMS */}
    <button
      className={`${styles.sideBtn} ${
        activeSection === "teams" ? styles.activeSection : ""
      }`}
      onClick={() => {
    setActiveSection("teams");
    setSidebarOpen(false);
}}
    >
      <div className={styles.navIconBox}>👥</div>

      <div className={styles.navTxt}>
        <div className={styles.navLbl}>TEAMS</div>
      </div>
    </button>

    {/* CTFS */}
    <button
      className={`${styles.sideBtn} ${
        activeSection === "ctfs" ? styles.activeSection : ""
      }`}
      onClick={() => {
    setActiveSection("ctfs");
    setSidebarOpen(false);
}}
    >
      <div className={styles.navIconBox}>⚑</div>

      <div className={styles.navTxt}>
        <div className={styles.navLbl}>CTFS</div>
      </div>
    </button>

    {/* RESULTS */}
    <button
      className={`${styles.sideBtn} ${
        activeSection === "results" ? styles.activeSection : ""
      }`}
      onClick={() => {
    setActiveSection("results");
    setSidebarOpen(false);
}}
    >
      <div className={styles.navIconBox}>📄</div>

      <div className={styles.navTxt}>
        <div className={styles.navLbl}>RESULTS</div>
      </div>
    </button>

    {/* LEADERBOARD */}
    <button
      className={`${styles.sideBtn} ${
        activeSection === "leaderboard" ? styles.activeSection : ""
      }`}
      onClick={() => {
    setActiveSection("leaderboard");
    setSidebarOpen(false);
}}
    >
      <div className={styles.navIconBox}>★</div>

      <div className={styles.navTxt}>
        <div className={styles.navLbl}>LEADERBOARD</div>
      </div>
    </button>

  </div>

  <div className={styles.sbFooter}>
    <div className={styles.sbVer}>// v1.0.0</div>
    <div className={styles.sbCopy}>Crucible</div>
  </div>

</aside>

  <main className={styles.contentArea}>

      <div className={styles.workspace}>

    <div className={styles.wsHead}>

        <div className={styles.wsHeadLeft}>

            <div className={styles.wsTitle}>
                {workspaceTitle}
            </div>

            <div className={styles.wsBreadcrumb}>
                {workspacePath}
            </div>

        </div>

        <div className={styles.wsActions}>
            {renderActions()}
        </div>

    </div>

     <div className={styles.workspaceScroll}>
    <div className={styles.wsBody}>

        {activeSection === "keys" && <KeysSection />}

        {activeSection === "teams" && <TeamsSection />}

        {activeSection === "ctfs" && <CtfSection />}

        {activeSection === "results" && <ResultsSection />}

        {activeSection === "leaderboard" && <LeaderboardSection />}

    </div>
      </div>
</div>

</main>

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
  const [master, setMaster] = useState("");
  const [pass, setPass] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function load() {
    const d = await api.adminKeys();
    setData(d);
    setMaster(d?.keys?.master?.value || "");
    setPass(d?.keys?.pass?.value || "");
    setUsername(d?.admin?.username || "");
  }

  useEffect(() => {
    load();
  }, []);

  if (!data) return null;

  const patchKey = (name, patch) =>
    api.adminPatchKey(name, patch).then(load);

  return (
    <>

      {/* MASTER KEY */}

      <div className={styles.item}>

<div className={styles.itemTop}>

  <strong>Master Key</strong>

  <span
    className={`${styles.badge} ${
      data.keys.master.status === "Active"
        ? styles.badgeActive
        : styles.badgeInactive
    }`}
  >
    {data.keys.master.status.toUpperCase()}
  </span>

</div>

        <input
          className={styles.input}
          value={master}
          onChange={(e) => setMaster(e.target.value)}
        />

        <div className={styles.row}>

  <button
    className={`${styles.btn} ${styles.btnGreen}`}
    onClick={() =>
      patchKey("master", { value: master })
    }
  >
    SAVE
  </button>

  <button
  className={`${styles.btn} ${
    data.keys.master.status === "Active"
      ? styles.btnRed
      : styles.btnGhost
  }`}
  onClick={() =>
    patchKey("master", {
      status:
        data.keys.master.status === "Active"
          ? "Inactive"
          : "Active",
    })
  }
>
  {data.keys.master.status === "Active"
    ? "DEACTIVATE"
    : "ACTIVATE"}
</button>

  <button
    className={`${styles.btn} ${styles.btnGhost}`}
    onClick={() =>
      api.adminRegenKey("master").then(load)
    }
  >
    REGENERATE
  </button>

</div>

      </div>

      {/* PASSKEY */}

      <div className={styles.item}>

<div className={styles.itemTop}>

  <strong>Passkey Login Toggle</strong>

  <span
    className={`${styles.badge} ${
      data.keys.pass.status === "Active"
        ? styles.badgeActive
        : styles.badgeInactive
    }`}
  >
    {data.keys.pass.status.toUpperCase()}
  </span>

</div>

        <input
          className={styles.input}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

<div className={styles.row}>

  <button
    className={`${styles.btn} ${styles.btnGreen}`}
    onClick={() =>
      patchKey("pass", { value: pass })
    }
  >
    SAVE
  </button>

  <button
    className={`${styles.btn} ${
  data.keys.pass.status === "Active"
    ? styles.btnRed
    : styles.btnGhost
}`}
  >
    {data.keys.pass.status === "Active"
      ? "DEACTIVATE"
      : "ACTIVATE"}
  </button>

  <button
    className={`${styles.btn} ${styles.btnGhost}`}
    onClick={() =>
      api.adminRegenKey("pass").then(load)
    }
  >
    REGENERATE
  </button>

</div>

      </div>

      {/* ADMIN CREDENTIALS */}

      <div className={styles.item}>

        <div className={styles.cardTitle}>
          ADMIN CREDENTIALS
        </div>

        <label className={styles.label}>
          USERNAME
        </label>

        <input
          className={styles.input}
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <label className={styles.label}>
          NEW PASSWORD
        </label>

        <input
          className={styles.input}
          type="password"
          placeholder="Leave blank to keep current password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
        />

        <div className={styles.row}>

          <button
  className={`${styles.btn} ${styles.btnGreen}`}
  onClick={async () => {
    await api.adminPatchCreds({
      username,
      ...(newPassword
        ? { password: newPassword }
        : {}),
    });

    setNewPassword("");
    load();
  }}
>
  UPDATE CREDENTIALS
</button>

        </div>

      </div>

    </>
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
    console.log(t);
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
  <>

    <div className={styles.row}>

  <input
    className={styles.input}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Team ID or Name"
  />

  <button
    className={styles.btn}
    onClick={doSearch}
  >
    FETCH
  </button>

  <button
    className={`${styles.btn} ${styles.btnGhost}`}
    onClick={() => {
      setSearch("");
      load();
    }}
  >
    REFRESH
  </button>

  <button
    className={`${styles.btn} ${styles.btnDanger}`}
    onClick={removeAll}
  >
    REMOVE ALL
  </button>

</div>

    {info && (
      <div className={styles.msgError}>
        {info}
      </div>
    )}

    <div className={styles.scroll}>

      {teams.map((t) => (

        <div
          key={t.teamId}
          className={styles.item}
        >

          <div className={styles.itemTop}>

            <strong>{t.name}</strong>

            <div className={styles.badgeGroup}>

              <span
                className={
                  t.submitted
                    ? styles.badgeSubmitted
                    : styles.badgeInactive
                }
              >
                {t.submitted
                  ? "SUBMITTED"
                  : "NOT SUBMITTED"}
              </span>

              <span
                className={
                  t.status === "Active"
                    ? styles.badgeActive
                    : styles.badgeInactive
                }
              >
                {t.status.toUpperCase()}
              </span>

            </div>

          </div>

          <div className={styles.kv}>

            <div>
              <span className={styles.kvKey}>
                ID:
              </span>
              {t.teamId}
            </div>

            <div>
              <span className={styles.kvKey}>
                ORG:
              </span>
              {t.organisation || "—"}
            </div>

            {t.members.map((m, i) => (

              <div key={i}>
                • {m.name} — {m.profession} ({m.gender})
              </div>

            ))}

          </div>

          <button
            className={`${styles.btn} ${styles.btnRed}`}
            onClick={() => remove(t.teamId)}
          >
            DELETE
          </button>

        </div>

      ))}

    </div>

  </>
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
    <>
      <NewCtfForm reload={load}/>
      {ctfs.map((ctf) => (
        <CtfCard 
        key={ctf.ctfId} 
        ctf={ctf} 
        reload={load} />
      ))}
    </>
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
    return <button className={`${styles.btn} ${styles.btnGreen}`}
    onClick={() => setOpen(true)}>
      + NEW CTF</button>;
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
      <div className={styles.ctfTop}>

<div className={styles.ctfName}>
        {ctf.name}
    </div>

        <span
          className={`${styles.badge} ${
          ctf.status === "Active"
          ? styles.badgeActive
          : styles.badgeInactive
        }`}
        >
          {ctf.status}</span>
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
          <div className={styles.row}
          style={{marginBottom: 0}}
          >
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setEditing(true)}>EDIT CTF</button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={async () => {
              await api.adminPatchCtf(ctf.ctfId, { status: ctf.status === 'Active' ? 'Inactive' : 'Active' });
              reload();
            }}>
              {ctf.status === 'Active' ? 'DEACTIVATE CTF' : 'ACTIVATE CTF'}
            </button>
            <button className={`${styles.btn} ${styles.btnRed}`} onClick={remove}>DELETE CTF</button>
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
      <button 
          className={`${styles.btn} ${styles.btnGreen}`}>
            + ADD FLAG
          </button>
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

    <div className={styles.flagLeft}>

        <div className={styles.flagTitle}>
            Flag {flag.flagNum} — {flag.name}
        </div>

    </div>

    <div className={styles.flagRight}>

        <span className={styles.flagPts}>
            {flag.points} pts
        </span>

        <span
            className={
                flag.status === "Active"
                    ? styles.badgeActive
                    : styles.badgeInactive
            }
        >
            {flag.status}
        </span>

    </div>

</div>

      {!editing ? (
        <div className={styles.flagBody}>
          <div className={styles.infoRow}>
    <span className={styles.infoLabel}>
        ANSWERS
    </span>

    <span>
        {(flag.answers || []).join(", ") || "—"}
    </span>
</div>
          <div className={styles.infoRow}>

    <span className={styles.infoLabel}>
        HINTS
    </span>

    <span>
        {(flag.hints || []).join(" · ") || "No hints"}
    </span>

</div>

          <div className={styles.flagButtons}>
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
            <button className={`${styles.btn} ${styles.btnRed}`} onClick={remove}>DELETE</button>
          </div>

          {preview && (

<div className={styles.previewCard}>

    <FlagPreview flag={flag} />

</div>

)}
        </div>
      ) : (
        <div className={styles.editCard}>
          <label className={styles.label}>Name</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
          <label className={styles.label}>Points</label>
          <input className={styles.input} type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
          <label className={styles.label}>Answers (one per line) — matched case-insensitively</label>
          <textarea className={styles.textarea} value={answers} onChange={(e) => setAnswers(e.target.value)} />
          <label className={styles.label}>Hints (one per line)</label>
          <textarea className={styles.textarea} value={hints} onChange={(e) => setHints(e.target.value)} />
          <div className={styles.editActions}>

    <button
        className={`${styles.btn} ${styles.btnGreen}`}
        onClick={save}
    >
        SAVE
    </button>

    <button
        className={`${styles.btn} ${styles.btnGhost}`}
        onClick={()=>{
            setEditing(false);
            setErr("");
        }}
    >
        CANCEL
    </button>

</div>
          <div className={`${styles.msg} ${styles.msgError}`}>{err}</div>
        </div>
      )}
    </div>
  );
}

// Live preview: how the flag appears to a team on the play page.
function FlagPreview({ flag }) {
  return (
    <div className={styles.previewCard}>

      <div className={styles.muted}>
        // TEAM VIEW PREVIEW
      </div>

      <div className={styles.flagTop}>

        <div className={styles.flagLeft}>
          <div className={styles.flagTitle}>
            Flag {flag.flagNum} — {flag.name}
          </div>
        </div>

        <div className={styles.flagRight}>
          <span className={styles.flagPts}>
            {flag.points} pts
          </span>

          <span
            className={`${styles.badge} ${
              flag.status === "Active"
                ? styles.badgeActive
                : styles.badgeInactive
            }`}
          >
            {flag.status}
          </span>
        </div>

      </div>

      <input
        className={styles.input}
        placeholder="Enter flag..."
        disabled
      />

      {(flag.hints || []).length > 0 && (
        <div className={styles.previewHints}>

          <div className={styles.previewHintTitle}>
            HINTS
          </div>

          <div className={styles.hintBox}>
            {flag.hints.map((hint, index) => (
              <div key={index}>
                • {hint}
              </div>
            ))}
          </div>

        </div>
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
    <>
      <div className={styles.row}>

  <input
    className={styles.input}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Team ID or Name"
  />

  <button
    className={styles.btn}
    onClick={doSearch}
  >
    FETCH
  </button>

  <button
    className={`${styles.btn} ${styles.btnGhost}`}
    onClick={() => {
      setSearch("");
      load();
    }}
  >
    REFRESH
  </button>

  <button
    className={`${styles.btn} ${styles.btnDanger}`}
    onClick={removeAll}
  >
    REMOVE ALL
  </button>

</div>

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
            <button
  className={`${styles.btn} ${styles.btnDanger} ${styles.deleteBtn}`}
  onClick={() => remove(r.teamId)}
>
  DELETE
</button>
          </div>
        ))}
      </div>
    </>
  );
}

// ============================ LEADERBOARD ============================
function LeaderboardSection() {
  const [rows, setRows] = useState([]);

  async function load() {
    const d = await api.adminLeaderboard();
    setRows(Array.isArray(d) ? d : []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className={styles.tableWrapper}>

      <table className={styles.table}>

        <thead>
          <tr>
            <th>RANK</th>
            <th>TEAM</th>
            <th>ID</th>
            <th>SCORE</th>
            <th>CAPTURED</th>
            <th>SUBMITTED</th>
          </tr>
        </thead>

        <tbody>

          {rows.length === 0 ? (

            <tr>
              <td
                colSpan={6}
                className={styles.emptyTable}
              >
                No leaderboard data available.
              </td>
            </tr>

          ) : (

            rows.map((r) => (

              <tr
                key={r.teamId}
                className={r.rank === 1 ? styles.firstPlace : ""}
              >

                <td>{r.rank}</td>

                <td className={styles.teamName}>
                  {r.teamName}
                </td>

                <td>{r.teamId}</td>

                <td className={styles.score}>
                  {r.totalScore}
                </td>

                <td>
                  {r.capturedCount}
                </td>

                <td>
                  {r.submittedAt
                    ? new Date(r.submittedAt).toLocaleString()
                    : "—"}
                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}
