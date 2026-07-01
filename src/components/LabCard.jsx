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
  path,
  status = "notStarted",
  completedPhases = 0,
  totalPhases = 0,
}) {
  const navigate = useNavigate();

  const statusConfig = {
    completed: {
      text: "COMPLETED",
      buttonText: "REVIEW LAB",
      className: styles.completed,
    },

    inProgress: {
      text: "IN PROGRESS",
      buttonText: "CONTINUE LAB",
      className: styles.inProgress,
    },

    notStarted: {
      text: "NOT STARTED",
      buttonText: "START LAB",
      className: styles.notCompleted,
    },
  };

  const currentStatus =
    statusConfig[status] || statusConfig.notStarted;

  return (
    <div
      className={styles.labCard}
      onClick={() => navigate(path)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(path);
        }
      }}
    >
      {/* PIXEL CORNERS */}
      <div className={styles.lcBl}></div>
      <div className={styles.lcBr}></div>

      {/* HEADER */}
      <div className={styles.cardHead}>
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
            currentStatus.className,
          ].join(" ")}
        >
          <div className={styles.chipDot}></div>

          {currentStatus.text}
        </div>
      </div>

      {/* BODY */}
      <div className={styles.cardBody}>
        <div className={styles.cardDesc}>
          {desc}
        </div>

        <div className={styles.cardChips}>
          {chips.map((chip, index) => (
            <span
              key={`${chip}-${index}`}
              className={styles.techChip}
            >
              {chip}
            </span>
          ))}
        </div>

        {totalPhases > 0 && (
          <div className={styles.labPhaseProgress}>
            {completedPhases}/{totalPhases} PHASES COMPLETED
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className={styles.cardFoot}>
        

        <div className={styles.cardActions}>
          <CyberButton
            className={styles.cardButton}
            onClick={(event) => {
              event.stopPropagation();
              navigate(path);
            }}
          >
            {currentStatus.buttonText}
          </CyberButton>
        </div>
      </div>
    </div>
  );
}