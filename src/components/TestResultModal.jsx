import { useEffect } from "react";
import CyberButton from "../components/CyberButton";
import styles from "../styles/Test.module.css";


export default function TestResultModal({
  score = 0,
  correct = 0,
  wrong = 0,
  total = 0,
  onRetry,
  onClose,
  testId
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = pct >= 70;

  useEffect(() => {
    localStorage.setItem(`test-result-${testId}`, JSON.stringify({
      score,
      correct,
      wrong,
      total,
      pct,
      passed
    }));
  }, [testId, score, correct, wrong, total, pct, passed]);

  return (
    <div className={styles.resultOverlay}>
      <div
        className={[
          styles.resultDialog,
          passed ? styles.pass : styles.fail
        ].join(" ")}
      >
        {/* 🔥 REQUIRED STRUCTURE */}
        <div className={styles.rdBl}></div>
        <div className={styles.rdBr}></div>
        <div className={styles.resultScanline}></div>

        {/* HEADER */}
        <div className={styles.resultHeader}>
          <div className={styles.resultHeaderLeft}>
            <div className={styles.resultHeaderIcon}>
              {passed ? "[ ✓ ]" : "[ ✗ ]"}
            </div>
            <div className={styles.resultHeaderTitle}>
              TEST MODULE {testId}
            </div>
          </div>

          <div className={styles.resultHeaderDots}>
            <div className={`${styles.rhd} ${styles.green}`}></div>
            <div className={`${styles.rhd} ${styles.amber}`}></div>
            <div className={`${styles.rhd} ${styles.red}`}></div>
          </div>
        </div>

        {/* SCORE HERO */}
        <div className={styles.resultScoreHero}>
          <div className={styles.resultVerdict}>
            {passed ? "PASSED" : "FAILED"}
          </div>

          <div className={styles.resultScoreNumber}>
            {String(score).padStart(3, "0")}
          </div>

          <div className={styles.resultScoreLabel}>FINAL SCORE</div>

          <div className={styles.resultPercent}>
            {pct}% CORRECT
          </div>
        </div>

        {/* STATS */}
        <div className={styles.resultStats}>

          <div className={styles.resultStat}>
            <div className={styles.resultStatValue}>{correct}</div>
            <div className={styles.resultStatLabel}>CORRECT</div>
          </div>

          <div className={styles.resultStat}>
            <div className={`${styles.resultStatValue} ${styles.red}`}>{wrong}</div>
            <div className={styles.resultStatLabel}>WRONG</div>
          </div>

          <div className={styles.resultStat}>
            <div className={`${styles.resultStatValue} ${styles.blue}`}>--</div>
            <div className={styles.resultStatLabel}>AVG TIME</div>
          </div>

          <div className={styles.resultStat}>
            <div className={`${styles.resultStatValue} ${styles.amber}`}>+{score}</div>
            <div className={styles.resultStatLabel}>XP EARNED</div>
          </div>

        </div>

        {/* PROGRESS */}
        <div className={styles.resultProgress}>

          <div className={styles.resultProgressHeader}>
            <div className={styles.resultProgressLabel}>SCORE BREAKDOWN</div>
            <div className={styles.resultProgressPercent}>{pct}%</div>
          </div>

          <div className={styles.resultProgressTrack}>
            <div
              className={styles.resultProgressFill}
              style={{ width: `${pct}%` }}
            ></div>
          </div>

          <div className={styles.resultThreshold}>
            <div className={styles.resultMarker}>
              <div className={styles.resultMarkerLine}></div>
              <div className={styles.resultMarkerLabel}>
                PASS MARK 70%
              </div>
            </div>
          </div>

        </div>

        {/* ACTIONS */}
        <div className={styles.resultActions}>
            <CyberButton onClick={onClose}>
             BACK
            </CyberButton>
          <button className={`${styles.resultButton} ${styles.secondaryButton}`} onClick={onRetry}>
            ↺ RETRY
          </button>

          <button className={`${styles.resultButton} ${styles.primaryButton}`} onClick={onClose}>
            ▶ NEXT LEVEL
          </button>
          
        </div>

      </div>
    </div>
  );
}