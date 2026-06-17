import { useEffect, useRef } from "react";
import CyberButton from '../components/CyberButton';
import PlayIcon from "./Icons/PlayIcon";
import styles from '../styles/Home.module.css';

export default function FinalChallengeCard({
  title = "CAPTURE THE FLAG",
  subtitle = "A full black-box CTF machine. Apply recon, exploitation and privilege escalation to capture all hidden flags.",
  onStart,
}) {
  

  return (
  <section className={styles.finalChallengeSection}>
    <div className={styles.finalChallengeCard}
     onClick={onStart}>

      {/* CORNERS */}
      <div className={styles.fcBl}></div>
      <div className={styles.fcBr}></div>

      <div className={styles.finalChallengeInner}>

        {/* LEFT ICON */}
        <div className={styles.finalChallengeIcon}>
  <svg
    className={styles.finalChallengeSvg}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#A1FFC2"
    strokeWidth="1.5"
  >
    <path d="M4 2v20" />
    <path d="M4 4h12l-2 4 2 4H4" />
  </svg>
</div>
        {/* TEXT */}
        <div className={styles.finalChallengeContent}>
          <div className={styles.finalChallengeHeading}>{title}</div>
          <div className={styles.finalChallengeSubtitle}>{subtitle}</div>
        </div>

        {/* BUTTON */}
        <div className={styles.finalChallengeButtonWrap}>
  <CyberButton
    onClick={(e) => {
      e.stopPropagation();
      onStart && onStart();
    }}
    variant="primary"
    size="medium"
    icon={<PlayIcon />}
  >
    START
  </CyberButton>
</div>

      </div>
    </div>
  </section>
);
}