import { useEffect, useState } from "react";
import CyberButton from "../components/CyberButton";
import styles from "../styles/Test.module.css";

const LOCK_KEY = "3q_test_lock_";

export default function AccessDeniedModal({
  testId = 1,
  duration = 15, // minutes
  score = 0,
  correct = 0,
  total = 0,
  onClose,
  onRetry
}) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [locked, setLocked] = useState(true);

  // 🔥 INIT LOCK
  useEffect(() => {
    const saved = localStorage.getItem(LOCK_KEY + testId);

    if (saved && Date.now() < parseInt(saved)) {
      setTimeLeft(parseInt(saved) - Date.now());
    } else {
      const lockUntil = Date.now() + duration * 60 * 1000;
      localStorage.setItem(LOCK_KEY + testId, lockUntil);
      setTimeLeft(lockUntil - Date.now());
    }
  }, [testId, duration]);

  // 🔥 COUNTDOWN
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          setLocked(false);
          localStorage.removeItem(LOCK_KEY + testId);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testId]);

  const minutes = String(Math.floor(timeLeft / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0");

  return (
    <div className={styles.lockOverlay}>

      <div className={styles.lockDialog}>
        <div className={styles.ldBl}></div>
        <div className={styles.ldBr}></div>

        {/* HEADER */}
        <div className={styles.lockHeader}>
          <div className={styles.lockHeaderLeft}>
            <div className={styles.lockAlertIcon}>[ !! ]</div>
            <div className={styles.lockHeaderTitle}>ACCESS DENIED</div>
          </div>

          <div className={styles.ldHeaderDots}>
            <div className={`${styles.lhd} ${styles.red}`}></div>
            <div className={`${styles.lhd} ${styles.amber}`}></div>
            <div className={`${styles.lhd} ${styles.green}`}></div>
          </div>
        </div>

        {/* ALERT BAR */}
        <div className={styles.lockAlertBar}>
          <div className={styles.lockSeparator}></div>
          <div className={styles.lockAlertBarText}>
            TEST LOCKED — MAX ATTEMPTS REACHED
          </div>
          <div className="ldSep"></div>
        </div>

        {/* BODY */}
        <div className={styles.lockBody}>

          <div className={styles.lockTitle}>TEST LOCKED</div>

          <div className={styles.lockSubtitle}>
            You have used all 3 attempts. Retry after{" "}
            <span className={styles.highlight}>{duration} MINUTES</span>
          </div>

          {/* TIMER */}
          <div className={styles.lockTimerWrap}>

            <div className={styles.timerLabelRow}>
              <div className={styles.timerDot}></div>
              <div className={styles.timerText}>RETRY AVAILABLE IN</div>
              <div className={styles.timerDot}></div>
            </div>

            <div className={styles.countdownDisplay}>
              {minutes}:{seconds}
            </div>

            <div className={styles.timerProgressTrack}>
              <div
                className={styles.timerProgressFill}
                style={{
                  width: `${(timeLeft / (duration * 60000)) * 100}%`
                }}
              />
            </div>

            <div className={styles.timerSub}>
              {locked
                ? "Test unlocks automatically"
                : "✓ Cooldown complete"}
            </div>

          </div>

          {/* ACTIONS */}

            <div className={styles.lockActions}>

                {/* ALWAYS visible */}
                <CyberButton onClick={onClose}>
                  BACK
                </CyberButton>

                {/* Only when unlocked */}
                {!locked && (
                  <CyberButton variant="primary" onClick={onRetry}>
                    RETRY TEST
                  </CyberButton>
                )}

            </div>


        </div>
      </div>
    </div>
  );
}