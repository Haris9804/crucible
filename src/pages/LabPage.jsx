import { useNavigate } from "react-router-dom";

import styles from "../styles/Lab.module.css";

import PlayIcon from "../components/Icons/PlayIcon";
import CyberButton from "../components/CyberButton";
import LabCard from "../components/LabCard";
import { labsData } from "../data/labsData";

export default function LabPage() {

  const navigate = useNavigate();

  return (

    <div className={styles.pageWrap}>

      {/* HEADER */}

      <div className={styles.labHeader}>

        <div className={styles.headerLeft}>

          <div className={styles.labLabel}>
            LEVEL 3
          </div>

          <div className={styles.labTitle}>
            HANDS-ON PRACTICAL
          </div>

        </div>

        <div className={styles.headerRight}>

          <div className={styles.liveBadge}>

            <div className={styles.liveDot}></div>

            LAB ENVIRONMENT

          </div>

          <CyberButton
            onClick={() => navigate("/")}
            icon={
              <PlayIcon
                style={{
                  transform: "rotate(180deg)"
                }}
              />
            }
          >
            BACK
          </CyberButton>

        </div>

      </div>

      {/* =========================================
          MAIN AREA
      ========================================= */}

      <div className={styles.modMain}>

        <div className={styles.modContent}>

          {/* TOP BORDER STRIP */}
          <div className={styles.contentHead}></div>

          {/* =========================================
              LAB CONTENT
          ========================================= */}

          <div className={styles.contentBody}>

            {/* =========================================
                LABS COLUMN
            ========================================= */}

            <div className={styles.labsColumn}>

              {labsData.map((lab, index) => {

                const nodeClass =
                  index === 0
                    ? "done"
                    : index === 1
                    ? "active"
                    : "locked";

                return (

                  <div
                    className={styles.labRow}
                    key={lab.id}
                  >

                    {/* =========================================
                        LEFT NODE TRACK
                    ========================================= */}

                    <div className={styles.levelSpine}>

                      <div className={styles.spineGroup}>

                        <div className={styles.spineNode}>

                          <div
                            className={[
                              styles.nodeCircle,
                              styles[nodeClass]
                            ].join(" ")}
                          >

                            {String(index + 1).padStart(2, "0")}

                          </div>

                        </div>

                        {index !== labsData.length - 1 && (
                          <div className={styles.nodeGap}></div>
                        )}

                      </div>

                    </div>

                    {/* =========================================
                        LAB CARD
                    ========================================= */}

                    <LabCard

                      id={lab.id}

                      title={lab.title}

                      desc={lab.desc}

                      chips={lab.chips}

                      xp={lab.xp}

                      time={lab.time}

                      diff={lab.difficulty}

                      path={lab.path}

                    />

                  </div>

                );

              })}

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          FOOTER
      ========================================= */}

      <div className={styles.labFooter}>

        <span>
          © 2026 Cyber Learning
        </span>

        <span>
          LAB · ACTIVE
        </span>

      </div>

    </div>

  );

}