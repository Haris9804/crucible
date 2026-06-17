import { useNavigate } from "react-router-dom";
import CyberButton from "../components/CyberButton";

import styles from "../styles/Lab.module.css";

export default function LabCard({
  id,
  title,
  desc,
  chips = [],
  xp,
  time,
  diff,
  completed = false,
  buttonText = "REVIEW",
  path = "/"
}) {


  const navigate = useNavigate();

  return (

      <div
        className={styles.labCard}
        onClick={() => navigate(path)}
      >

        {/* PIXEL CORNERS */}
        <div className={styles.lcBl}></div>
        <div className={styles.lcBr}></div>

        {/* =========================================
            HEADER
        ========================================= */}

        <div className={styles.cardHead}>

          {/* LEFT SIDE */}
          <div className={styles.cardHeadLeft}>

            <div className={styles.cardNum}>
              LAB-{String(id).padStart(2, "0")}
            </div>

            <div className={styles.cardTitleWrap}>

              <div className={styles.cardTitle}>
                {title}
              </div>

            </div>

          </div>

          {/* STATUS CHIP */}
          <div
            className={[
              styles.cardChip,
              completed
                ? styles.completed
                : styles.notCompleted
            ].join(" ")}
          >

            <div className={styles.chipDot}></div>

            {
              completed
                ? "COMPLETED"
                : "NOT COMPLETED"
            }

          </div>

        </div>

        {/* =========================================
            BODY
        ========================================= */}

        <div className={styles.cardBody}>

          <div className={styles.cardDesc}>
            {desc}
          </div>

          <div className={styles.cardChips}>

            {chips.map((chip, i) => (

              <span
                key={i}
                className={styles.techChip}
              >
                {chip}
              </span>

            ))}

          </div>

        </div>

        {/* =========================================
            FOOTER
        ========================================= */}

        <div className={styles.cardFoot}>

          {/* META */}
          <div className={styles.cardMeta}>

            <div className={styles.metaItem}>

              <div className={styles.metaLabel}>
                XP
              </div>

              <div className={styles.metaVal}>
                {xp}
              </div>

            </div>

            <div className={styles.metaItem}>

              <div className={styles.metaLabel}>
                TIME
              </div>

              <div className={styles.metaVal}>
                {time}
              </div>

            </div>

            <div className={styles.metaItem}>

              <div className={styles.metaLabel}>
                DIFF
              </div>

              <div className={styles.metaVal}>
                {diff}
              </div>

            </div>

          </div>

          {/* ACTIONS */}
          <div className={styles.cardActions}>

            <CyberButton
                className={styles.cardButton}
                onClick={(e) => {
                
                  e.stopPropagation();
                
                  navigate(path);
                
                }}
               >
              {buttonText}
            </CyberButton>
          </div>
        </div>
      </div>
    
  );
}