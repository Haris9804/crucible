import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/ctfApi';
import { useReveal } from '../../animations/useReveal';
import styles from '../../styles/CtfPlay.module.css';

import CyberButton from '../../components/CyberButton';
import PlayIcon from '../../components/Icons/PlayIcon';

const getFlags = (ctf) => (Array.isArray(ctf?.flags) ? ctf.flags : []);
const hasAnswer = (value) => String(value ?? '').trim().length > 0;

export default function CtfPlayPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [team, setTeam] = useState(null);
  const [ctfs, setCtfs] = useState([]);
  const [responses, setResponses] = useState({});
  const [openHints, setOpenHints] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeCtfId, setActiveCtfId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useReveal(pageRef, [loading, result, activeCtfId]);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        const me = await api.teamMe();

        if (!me?.success) {
          navigate('/ctf');
          return;
        }

        if (cancelled) return;
        setTeam(me.team);

        const existing = await api.teamResult();
        if (cancelled) return;

        if (existing?.found) {
          setResult(existing.result);
          return;
        }

        const data = await api.teamCtfs();
        if (cancelled) return;

        if (data?.success) {
          const loadedCtfs = Array.isArray(data.ctfs) ? data.ctfs : [];
          setCtfs(loadedCtfs);
          setActiveCtfId(loadedCtfs[0]?.ctfId ?? null);
        } else {
          setNotice(data?.message || 'Unable to load CTF missions.');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Unable to load CTF page:', error);
          setNotice('Unable to load the CTF page. Please refresh and try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        setConfirming(false);
      }
    }

    function handleResize() {
      if (window.innerWidth > 900) {
        setSidebarOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  async function logout() {
    await api.logout();
    navigate('/ctf');
  }

  function setAnswer(ctfId, flagNum, value) {
    setResponses((previous) => ({
      ...previous,
      [ctfId]: {
        ...(previous[ctfId] || {}),
        [flagNum]: value,
      },
    }));
  }

  function toggleHint(key) {
    setOpenHints((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  async function submit() {
    setConfirming(false);
    setNotice('');

    try {
      const data = await api.teamSubmit(responses);

      if (data?.success) {
        setResult(data.result);
      } else {
        setNotice(data?.message || 'Submission failed.');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setNotice('Submission failed. Please try again.');
    }
  }

  if (loading) {
    return <div className={styles.page}>Loading...</div>;
  }

  return (
    <div className={styles.page} ref={pageRef}>
      {sidebarOpen && (
        <button
          type="button"
          className={`${styles.sidebarOverlay} ${styles.sidebarOverlayActive}`}
          aria-label="Close CTF navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.title} data-glitch>
            CTF ADMIN PORTAL
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label="Open CTF navigation"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            ☰
          </button>

          <div className={styles.liveChip}>
            <div className={styles.liveDot} />
            TEAM ACTIVE
          </div>

          <CyberButton
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={logout}
            icon={<PlayIcon style={{ transform: 'rotate(180deg)' }} />}
          >
            LOGOUT
          </CyberButton>
        </div>
      </header>

      <main className={styles.wide}>
        {result ? (
          <ResultView result={result} />
        ) : (
          <PlayView
            team={team}
            ctfs={ctfs}
            responses={responses}
            openHints={openHints}
            activeCtfId={activeCtfId}
            setActiveCtfId={setActiveCtfId}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onAnswer={setAnswer}
            onToggleHint={toggleHint}
            onSubmit={() => setConfirming(true)}
            notice={notice}
          />
        )}
      </main>

      {confirming && (
        <div
          className={styles.overlay}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirming(false);
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-dialog-title"
          >
            <p id="submit-dialog-title">
              This action cannot be undone. Submit all responses for grading?
            </p>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={submit}>
                CONFIRM
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => setConfirming(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayView({
  team,
  ctfs,
  responses,
  openHints,
  activeCtfId,
  setActiveCtfId,
  sidebarOpen,
  setSidebarOpen,
  onAnswer,
  onToggleHint,
  onSubmit,
  notice,
}) {
  // Keep the team details open on desktop, but collapsed by default on mobile.
  const [teamOpen, setTeamOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(max-width: 768px)').matches;
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    function handleViewportChange(event) {
      // Automatically collapse when entering mobile view and reopen on desktop.
      setTeamOpen(!event.matches);
    }

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', handleViewportChange);
      return () => mobileQuery.removeEventListener('change', handleViewportChange);
    }

    mobileQuery.addListener(handleViewportChange);
    return () => mobileQuery.removeListener(handleViewportChange);
  }, []);

  const currentCtf =
    ctfs.find((ctf) => String(ctf.ctfId) === String(activeCtfId)) ||
    ctfs[0] ||
    null;

  const totalFlags = ctfs.reduce((sum, ctf) => sum + getFlags(ctf).length, 0);

  const answeredFlags = Object.values(responses).reduce(
    (sum, ctfResponses) =>
      sum + Object.values(ctfResponses || {}).filter(hasAnswer).length,
    0,
  );

  const overallProgress = totalFlags
    ? Math.round((answeredFlags / totalFlags) * 100)
    : 0;

  const currentFlags = getFlags(currentCtf);
  const currentAnswered = currentFlags.filter((flag) =>
    hasAnswer(responses[currentCtf?.ctfId]?.[flag.flagNum]),
  ).length;

  const currentProgress = currentFlags.length
    ? Math.round((currentAnswered / currentFlags.length) * 100)
    : 0;

  function selectCtf(event, ctfId) {
    event.preventDefault();
    event.stopPropagation();

    setActiveCtfId(ctfId);

    if (window.matchMedia('(max-width: 900px)').matches) {
      setSidebarOpen(false);
    }
  }

  function requestSubmission(event) {
    event.preventDefault();
    event.stopPropagation();
    onSubmit();
  }

  return (
    <>
      {team && (
        <section className={styles.teamPanel} data-reveal>
          <button
            type="button"
            className={styles.teamHeader}
            onClick={() => setTeamOpen((open) => !open)}
            aria-expanded={teamOpen}
            aria-controls="team-details-panel"
          >
            <span>// TEAM DETAILS</span>

            <span className={styles.teamArrow} aria-hidden="true">
              {teamOpen ? '▲' : '▼'}
            </span>
          </button>

          {teamOpen && (
            <div id="team-details-panel" className={styles.teamCard}>
              <div className={styles.teamCell}>
                <div className={styles.teamLabel}>TEAM NAME</div>
                <div className={`${styles.teamValue} ${styles.teamValueBig}`}>
                  {team.name}
                </div>
                <div className={styles.teamId}>ID: {team.teamId}</div>
              </div>

              <div className={styles.teamCell}>
                <div className={styles.teamLabel}>MEMBERS</div>
                <div className={styles.teamMembers}>
                  {(team.members || []).map((member, index) => (
                    <div
                      key={`${member.name}-${index}`}
                      className={styles.teamMember}
                    >
                      • {member.name} — {member.profession} ({member.gender})
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.teamCell}>
                <div className={styles.teamLabel}>ORGANISATION</div>
                <div className={styles.teamValue}>
                  {team.organisation || '—'}
                </div>
                <div className={styles.teamLabel}>STATUS</div>
                <div className={styles.teamStatus}>▶ ACTIVE</div>
              </div>

              <div className={styles.teamCell}>
                <div className={styles.teamLabel}>OVERALL PROGRESS</div>
                <div className={styles.teamProgress}>
                  <div className={styles.teamProgressLabel}>
                    <span>
                      {answeredFlags}/{totalFlags} flags
                    </span>
                    <span>{overallProgress}%</span>
                  </div>

                  <div className={styles.teamProgressTrack}>
                    <div
                      className={styles.teamProgressFill}
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className={styles.teamScore}>000</div>
                <div className={styles.teamScoreLabel}>TOTAL PTS</div>
              </div>
            </div>
          )}
        </section>
      )}

      {ctfs.length === 0 ? (
        <div className={styles.section}>No active CTFs right now.</div>
      ) : (
        <div className={styles.bodyRow}>
          <aside
            className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
            aria-label="CTF missions"
          >
            <div className={styles.sbHead}>
              // CTF MISSIONS
              <div className={styles.sbHeadDot} />
            </div>

            <nav className={styles.navScroll}>
              {ctfs.map((ctf, index) => {
                const flags = getFlags(ctf);
                const filled = flags.filter((flag) =>
                  hasAnswer(responses[ctf.ctfId]?.[flag.flagNum]),
                ).length;
                const percentage = flags.length
                  ? Math.round((filled / flags.length) * 100)
                  : 0;
                const isActive =
                  String(currentCtf?.ctfId) === String(ctf.ctfId);

                return (
                  <button
                    key={ctf.ctfId}
                    type="button"
                    className={`${styles.navItem} ${
                      isActive ? styles.activeNav : ''
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(event) => selectCtf(event, ctf.ctfId)}
                  >
                    <div className={styles.navIcon}>{index === 0 ? '⚑' : '◎'}</div>

                    <div className={styles.navTxt}>
                      <div className={styles.navLbl}>{ctf.name}</div>
                      <div className={styles.navSub}>
                        {flags.length} Flags · {percentage}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className={styles.sbFooter}>
              <div className={styles.sbAnswered}>
                {answeredFlags}/{totalFlags} ANSWERED
              </div>

              <button
                type="button"
                className={styles.btn}
                onClick={requestSubmission}
              >
                SUBMIT RESPONSES
              </button>

              {notice && (
                <div className={`${styles.msg} ${styles.msgError}`} role="alert">
                  {notice}
                </div>
              )}
            </div>
          </aside>

          <section
            key={String(currentCtf?.ctfId ?? 'empty')}
            className={styles.workspace}
          >
            <div className={styles.wsHead}>
              <div className={styles.wsHeadLeft}>
                <div className={styles.wsCtfName}>{currentCtf?.name}</div>
                <div className={styles.wsBc}>
                  CTF #{currentCtf?.ctfId} · {currentFlags.length} Flags
                </div>
              </div>

              <div className={styles.wsRight}>
                <div className={styles.wsAnswered}>
                  {currentAnswered}/{currentFlags.length} ANSWERED
                </div>
              </div>
            </div>

            <div className={styles.workspaceScroll}>
              <div className={styles.wsBody}>
                {Array.isArray(currentCtf?.instructions) &&
                  currentCtf.instructions.length > 0 && (
                    <div className={styles.wsInstructions}>
                      {currentCtf.instructions.join(' • ')}
                    </div>
                  )}

                <div className={styles.wsProgRow}>
                  <div className={styles.wsProgTrack}>
                    <div
                      className={styles.wsProgFill}
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                  <div className={styles.wsProgPct}>{currentProgress}%</div>
                </div>

                {currentFlags.map((flag) => {
                  const key = `${currentCtf.ctfId}-${flag.flagNum}`;
                  const value = responses[currentCtf.ctfId]?.[flag.flagNum] || '';
                  const answered = hasAnswer(value);

                  return (
                    <article
                      key={key}
                      className={`${styles.flagItem} ${
                        answered ? styles.answered : ''
                      }`}
                    >
                      <div className={styles.fiTop}>
                        <span className={styles.fiNum}>
                          FLAG {String(flag.flagNum).padStart(2, '0')}
                        </span>
                        <span className={styles.fiName}>{flag.name}</span>
                        <span className={styles.fiPts}>{flag.points} pts</span>
                      </div>

                      <input
                        className={`${styles.flagInput} ${
                          answered ? styles.hasVal : ''
                        }`}
                        placeholder="Enter flag here..."
                        value={value}
                        onChange={(event) =>
                          onAnswer(
                            currentCtf.ctfId,
                            flag.flagNum,
                            event.target.value,
                          )
                        }
                      />

                      {Array.isArray(flag.hints) && flag.hints.length > 0 && (
                        <>
                          <button
                            type="button"
                            className={`${styles.hintBtn} ${
                              openHints[key] ? styles.hintOpen : ''
                            }`}
                            onClick={() => onToggleHint(key)}
                          >
                            {openHints[key] ? '✕ HIDE HINT' : '◆ HINT'}
                          </button>

                          {openHints[key] && (
                            <div className={styles.hintBox}>
                              {flag.hints.map((hint, index) => (
                                <div key={`${key}-hint-${index}`}>• {hint}</div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function ResultView({ result }) {
  return (
    <div className={styles.resultScroll}>
      <div className={styles.section} data-reveal>
        <div className={styles.sectionTitle}>
          // SUBMISSION REPORT — {result.teamName}
        </div>
        <div className={styles.kv}>
          <div>
  <strong>Team ID:</strong>{" "}
  <span className={styles.resultValue}>
    {result.teamId}
  </span>
</div>
          <div>
  <strong>Organisation:</strong>{" "}
  <span className={styles.resultValue}>
    {result.organisation || "—"}
  </span>
</div>
          <div>
  <strong>Total Flags:</strong>{" "}
  <span className={styles.resultValue}>
    {result.totalFlags}
  </span>
</div>
          <div>
  <strong>Max Points:</strong>{" "}
  <span className={styles.resultValue}>
    {result.allPoints}
  </span>
</div>
          <div>
  <strong>Captured:</strong>{" "}
  <span className={styles.resultValue}>
    {result.capturedCount}
  </span>
</div>
          <div>
  <strong>Uncaptured:</strong>{" "}
  <span className={styles.resultValue}>
    {result.uncapturedCount}
  </span>
</div>
          <div>
  <strong>Total Score:</strong>{" "}
  <span className={styles.resultValue}>
    {result.totalScore}
  </span>
</div>
          <div>
  <strong>Submitted:</strong>{" "}
  <span className={styles.resultValue}>
    {new Date(result.submittedAt).toLocaleString()}
  </span>
</div>
        </div>
      </div>

      {(result.ctfs || []).map((ctf) => (
        <div key={ctf.ctfId} className={styles.ctfBox} data-reveal>
          <div className={styles.ctfName}>{ctf.ctfName}</div>
          {(ctf.flags || []).map((flag) => (
            <div key={flag.flagNum} className={styles.flagTop}>
              <span>
                Flag {flag.flagNum}:{' '}
                <span
                  className={
                    flag.response === 'Captured'
                      ? styles.captured
                      : styles.uncaptured
                  }
                >
                  {flag.response}
                </span>
              </span>
              <span className={styles.muted}>
                Submitted: {flag.submitted || '—'}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
