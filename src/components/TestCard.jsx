import { useNavigate } from 'react-router-dom';

import styles from "../styles/Home.module.css";

import { useState } from 'react';
import CyberButton from '../components/CyberButton';
import PlayIcon from "./Icons/PlayIcon";

export default function TestCard({
  moduleNumber,
  moduleName,
  category,
  score = 0,
  progress = 0,
  status = 'unlocked',
}) {
  const navigate = useNavigate();
  const [showMsg, setShowMsg] = useState(false);

  const prevModule = Number(moduleNumber) - 1;

  // 🔥 BETTER LOCK LOGIC
  const isLocked = status === 'locked';
  const needsPrev = prevModule > 0 && isLocked;

  // 🔥 PROGRESS UI
  const progColor =
    progress === 100 ? '#00ff41'
    : progress > 0 ? '#ffaa00'
    : '#00ff41';

  const progLabel =
    progress === 100 ? 'DONE'
    : progress > 0 ? 'IN PROGRESS'
    : 'NOT STARTED';

  //  BUTTON TEXT
  const btnLabel =
    status === 'completed' ? '↺ RETRY'
    : progress > 0 ? 'CONTINUE'
    : 'TAKE TEST';

  const cardClass = [
  styles.testCard,
  status === 'completed' ? styles.completed : '',
  isLocked ? styles.locked : ''
].filter(Boolean).join(' ');

  function handleBtn(e) {
    e.stopPropagation();

    if (needsPrev) {
      setShowMsg(true);
      setTimeout(() => setShowMsg(false), 3000);
      return;
    }

    // ✅ FIXED NAVIGATION
    navigate(`/test/${moduleNumber}`);
  }

  return (
    <div className={cardClass}>
      <div className={styles.tcBl} />
      <div className={styles.tcBr}/>

      {showMsg && (
        <div className={styles.tcLockMsg}>
          ⚠ COMPLETE MODULE {String(prevModule).padStart(2, '0')} TEST FIRST
        </div>
      )}

      {/* THUMB */}
      <div className={styles.tcThumb}>
        <svg viewBox="0 0 40 40" width="36" height="36">
          <rect x="1" y="1" width="38" height="38" stroke="#00ff4144" />
          <text
            x="20"
            y="27"
            textAnchor="middle"
            fontFamily="'Press Start 2P'"
            fontSize="18"
            fill="#00ff41"
          >
            ?
          </text>
        </svg>

        {score > 0 && (
          <div
            className={[
              styles.thumbScore,
              score >= 70
                ? styles.scoreHigh
                : score >= 40
                ? styles.scoreMid
                : styles.scoreLow
            ].join(" ")}
          >
            {score}%
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className={styles.tcContent}>

        <div className={styles.tcTop}>
          <div className={styles.tcCategory}>{category}</div>
          <div className={styles.tcHeading}>
            MOD-{String(moduleNumber).padStart(2, '0')} // {moduleName}
          </div>
        </div>

        <div className={styles.tcButton}>

          {/* PROGRESS */}
          <div className={styles.tcProgWrap}>

            {progress > 0 && (
              <div className={styles.tcProgTrack}>
                <div
                  className={styles.tcProgFill}
                  style={{
                    width: `${progress}%`,
                    background: progColor
                  }}
                />
              </div>
            )}

            <div className={styles.tcProgLabel}>{progLabel}</div>
          </div>

          {/* BEST SCORE */}
          {score > 0 && (
            <div className={styles.tcBest}>
              <span>{score}%</span> BEST
            </div>
          )}

          {/* BUTTON */}
          <CyberButton
            onClick={handleBtn}
            variant={status === 'completed' ? 'retry' : 'primary'}
            size="small"
            icon={<PlayIcon />}
            disabled={needsPrev}
          >
            {btnLabel}
          </CyberButton>

        </div>
      </div>
    </div>
  );
}