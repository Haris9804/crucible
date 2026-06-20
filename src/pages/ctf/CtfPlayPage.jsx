import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/ctfApi';
import { useReveal } from '../../animations/useReveal';
import styles from '../../styles/Ctf.module.css';

export default function CtfPlayPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [team, setTeam] = useState(null);
  const [ctfs, setCtfs] = useState([]);
  const [responses, setResponses] = useState({}); // { ctfId: { flagNum: value } }
  const [openHints, setOpenHints] = useState({}); // "ctfId-flagNum": true
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState('');

  useReveal(pageRef, [loading, result]);

  useEffect(() => {
    (async () => {
      const me = await api.teamMe();
      if (!me?.success) { navigate('/ctf'); return; }
      setTeam(me.team);

      const existing = await api.teamResult();
      if (existing?.found) {
        setResult(existing.result);
      } else {
        const data = await api.teamCtfs();
        if (data?.success) setCtfs(data.ctfs);
      }
      setLoading(false);
    })();
  }, [navigate]);

  async function logout() {
    await api.logout();
    navigate('/ctf');
  }

  function setAnswer(ctfId, flagNum, value) {
    setResponses((prev) => ({ ...prev, [ctfId]: { ...prev[ctfId], [flagNum]: value } }));
  }

  function toggleHint(key) {
    setOpenHints((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function submit() {
    setConfirming(false);
    const d = await api.teamSubmit(responses);
    if (d?.success) setResult(d.result);
    else setNotice(d?.message || 'Submission failed');
  }

  if (loading) return <div className={styles.page}>Loading...</div>;

  return (
    <div className={styles.page} ref={pageRef}>
      <div className={styles.header}>
        <div>
          <div className={styles.title} data-glitch>CTF PLAYGROUND</div>
          {team && <div className={styles.subtitle}>{team.name} · {team.teamId}</div>}
        </div>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={logout}>LOGOUT</button>
      </div>

      <div className={styles.wide}>
        {result ? (
          <ResultView result={result} />
        ) : (
          <PlayView
            team={team}
            ctfs={ctfs}
            responses={responses}
            openHints={openHints}
            onAnswer={setAnswer}
            onToggleHint={toggleHint}
            onSubmit={() => setConfirming(true)}
            notice={notice}
          />
        )}
      </div>

      {confirming && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <p>This action cannot be undone. Submit all responses for grading?</p>
            <button className={styles.btn} onClick={submit}>CONFIRM</button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setConfirming(false)}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayView({ team, ctfs, responses, openHints, onAnswer, onToggleHint, onSubmit, notice }) {
  return (
    <>
      <div className={styles.section} data-reveal>
        <div className={styles.sectionTitle}>// TEAM INFO</div>
        <div className={styles.kv}>
          <div><strong>Team ID:</strong> {team.teamId}</div>
          <div><strong>Organisation:</strong> {team.organisation || '—'}</div>
          <div><strong>Members:</strong></div>
          {team.members.map((m, i) => (
            <div key={i}>· {m.name} — {m.profession} ({m.gender})</div>
          ))}
        </div>
      </div>

      {ctfs.length === 0 && <div className={styles.section}>No active CTFs right now.</div>}

      {ctfs.map((ctf) => {
        const filled = ctf.flags.filter((f) => (responses[ctf.ctfId]?.[f.flagNum] || '').trim() !== '').length;
        const pct = ctf.flags.length ? (filled / ctf.flags.length) * 100 : 0;
        return (
          <div key={ctf.ctfId} className={styles.ctfBox} data-reveal>
            <div className={styles.ctfHeading}>
              <span className={styles.ctfName}>{ctf.name}</span>
              <span>{filled} / {ctf.flags.length} answered</span>
            </div>
            {ctf.instructions?.length > 0 && (
              <div className={styles.muted}>{ctf.instructions.join(' · ')}</div>
            )}
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${pct}%` }} />
            </div>

            {ctf.flags.map((f) => {
              const key = `${ctf.ctfId}-${f.flagNum}`;
              return (
                <div key={key} className={styles.flagItem}>
                  <div className={styles.flagTop}>
                    <span>Flag {f.flagNum} — {f.name}</span>
                    <span className={styles.flagPts}>{f.points} pts</span>
                  </div>
                  <input
                    className={styles.input}
                    placeholder="Enter flag"
                    value={responses[ctf.ctfId]?.[f.flagNum] || ''}
                    onChange={(e) => onAnswer(ctf.ctfId, f.flagNum, e.target.value)}
                  />
                  {f.hints?.length > 0 && (
                    <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => onToggleHint(key)}>
                      {openHints[key] ? 'HIDE HINT' : 'HINT'}
                    </button>
                  )}
                  {openHints[key] && (
                    <div className={styles.hint}>
                      {f.hints.map((h, i) => <div key={i}>• {h}</div>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {ctfs.length > 0 && (
        <>
          <button className={styles.btn} onClick={onSubmit}>SUBMIT ALL RESPONSES</button>
          <div className={`${styles.msg} ${styles.msgError}`}>{notice}</div>
        </>
      )}
    </>
  );
}

function ResultView({ result }) {
  return (
    <>
      <div className={styles.section} data-reveal>
        <div className={styles.sectionTitle}>// SUBMISSION REPORT — {result.teamName}</div>
        <div className={styles.kv}>
          <div><strong>Team ID:</strong> {result.teamId}</div>
          <div><strong>Organisation:</strong> {result.organisation || '—'}</div>
          <div><strong>Total Flags:</strong> {result.totalFlags}</div>
          <div><strong>Max Points:</strong> {result.allPoints}</div>
          <div><strong>Captured:</strong> {result.capturedCount}</div>
          <div><strong>Uncaptured:</strong> {result.uncapturedCount}</div>
          <div><strong>Total Score:</strong> {result.totalScore}</div>
          <div><strong>Submitted:</strong> {new Date(result.submittedAt).toLocaleString()}</div>
        </div>
      </div>

      {result.ctfs.map((ctf) => (
        <div key={ctf.ctfId} className={styles.ctfBox} data-reveal>
          <div className={styles.ctfName}>{ctf.ctfName}</div>
          {ctf.flags.map((f) => (
            <div key={f.flagNum} className={styles.flagTop}>
              <span>
                Flag {f.flagNum}:{' '}
                <span className={f.response === 'Captured' ? styles.active : styles.inactive}>
                  {f.response}
                </span>
              </span>
              <span className={styles.muted}>Submitted: {f.submitted || '—'}</span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
