import CyberButton from '../components/CyberButton';
import PlayIcon from "./Icons/PlayIcon";
import '../styles/globals.css';
import styles from '../styles/Home.module.css';

function PracticalCard({
  title = "PRACTICAL HACKING LABS",
  subtitle = "",
  progress = 0,
  onStart,
}) {
  return (
    <section className={styles.practicalSection}>
      <div className={styles.practicalCard} onClick={onStart}>
        
        {/* CORNERS (REQUIRED FOR BORDER SYSTEM) */}
        <div className={styles.pcBl}></div>
        <div className={styles.pcBr}></div>

        <div className={styles.practicalInner}>

          {/* LEFT CONTENT */}
          <div className={styles.practicalText}>
            <div className={styles.practicalHeading}>{title}</div>

            <div className={styles.practicalSubtitle}>
              {subtitle}
            </div>

            {/* PROGRESS */}
            <div className={styles.practicalProgress}>
              <div className={styles.progressLabel}>PROGRESS</div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className={styles.progressPercent}>{progress}%</div>
            </div>
          </div>

          {/* RIGHT BUTTON */}
          <CyberButton
            onClick={(e) => {
              e.stopPropagation();
              onStart && onStart();
            }}
            variant="primary"
            size="medium"
            icon={<PlayIcon />}
          >
            START LABS
          </CyberButton>
        </div>
      </div>
    </section>
  );
}

export default PracticalCard;