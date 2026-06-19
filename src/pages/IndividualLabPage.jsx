import { useState } from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import styles from "../styles/IndividualLab.module.css";

import lab1 from "../data/labs/lab1.json";
import lab2 from "../data/labs/lab2.json";
import lab3 from "../data/labs/lab3.json";
import lab4 from "../data/labs/lab4.json";

export default function IndividualLabPage() {

  const navigate = useNavigate();

  const { labId } = useParams();

  const labs = {
    1: lab1,
    2: lab2,
    3: lab3,
    4: lab4
  };

  const labData = labs[labId];

  const [currentPhase, setCurrentPhase] =
    useState(0);

  const [selectedTabs, setSelectedTabs] =
    useState({});

  const [completedPhases, setCompletedPhases] =
    useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!labData) {

    return (

       <>
        <div
          className={[
            styles.sidebarOverlay,
            sidebarOpen ? styles.active : ""
          ].join(" ")}
          onClick={() => setSidebarOpen(false)}
        />

  <div className={styles.pageWrap}>
        <div className={styles.labContent}>
          <div className={styles.contentBody}>
            <div className={styles.phaseTitle}>
              LAB NOT FOUND
            </div>
          </div>
        </div>
      </div>
    </>
    );
  }

  const phase =
    labData.phases[currentPhase];
  const handleTab = (
    phaseId,
    tabId
  ) => {
    setSelectedTabs((prev) => ({
      ...prev,
      [phaseId]: tabId
    }));
  };

  const handleCompletePhase = () => {
    if (
      !completedPhases.includes(currentPhase)
    ) {
      setCompletedPhases([
        ...completedPhases,
        currentPhase
      ]);
    }
  };

  const renderBlock = (block) => {
    switch (block.type) {
      case "warning":
        return (
          <div className={`${styles.infoBox} ${styles.amber}`}>
            <div className={`${styles.infoText} ${styles.amberText}`}>
              ⚠ {block.content}
            </div>
          </div>
        );

      case "requirements":
        return (
          <div className={`${styles.infoBox} ${styles.amber}`}>
            <div className={styles.prereqList}>
              {block.items.map((item, i) => (
                <div
                  key={i}
                  className={styles.prereqItem}
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        );

      case "steps":
        return (
          <div className={styles.prereqItem}>
            {block.title && (
              <div className={styles.stepSubHeading}>
                {block.title}
              </div>
            )}
            {block.items.map((step, i) => (
              <div
                key={i}
                className={styles.stepItem}
              >
                <div className={styles.stepNum}>
                  {String(i + 1).padStart( 2, "0" )}
                </div>
                <div className={styles.stepText}>
                  {step}
                </div>
                <div className={styles.stepCheck}> ✓ </div>
              </div>
            ))}
          </div>
        );

      case "commands":
        return (
          <div className={styles.codeWrap}>
            <div className={styles.codeHeader}> TERMINAL COMMANDS </div>
            <div className={styles.codeBlock}>
              {block.items.map((cmd, i) => (
                <div
                  key={i}
                  className={styles.codeLine}
                >
                  <span className={styles.lineNumber}> {i + 1} </span>
                  <span className={styles.command}> {cmd} </span>
                </div>
              ))}
            </div>
          </div>
        );

      case "links":

        return (
          <div className={styles.ytWrap}>
            {block.items.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noreferrer"
                className={styles.ytItem}
              >
                <span className={styles.ytIcon}>  ▶ </span>
                <span className={styles.ytUrl}> {link} </span>
              </a>
            ))}
          </div>
        );

      case "tabs":

        const activeTab =
          selectedTabs[phase.id] ||
          block.tabs[0].id;

        const selectedTab =
          block.tabs.find(
            (tab) => tab.id === activeTab
          );

        return (

          <div>
            <div className={styles.hvToggleWrap}>
              {block.tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={[
                    styles.hvButton,
                    activeTab===tab.id ? styles.active : ""
                  ].join(" ")}
                  onClick={() =>
                    handleTab(
                      phase.id,
                      tab.id
                    ) 
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className={[
                  styles.hvSection,
                  styles.show
                ].join(" ")}>
              {selectedTab.blocks.map(
                (nestedBlock, i) => (
                  <div
                    key={i}
                    className={styles.nestedBlock}
                  >
                    {renderBlock(
                      nestedBlock
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (

    <div className={styles.pageWrap}>
      {/* HEADER */}
      <div className={styles.labHeader}>
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
        ◄ BACK
        </button>
        <div className={styles.headerDivider}></div>
        <div className={styles.headerTitleWrap}>
          <div className={styles.headerTag}>
            LAB-{labData.id}
          </div>
          <div className={styles.headerTitle}>
            {labData.title}
          </div>
        </div>
        <div className={styles.headerRight}>

          <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(true)}
            >
              ☰
          </button>

          <div className={styles.progressChip}>
            PHASES {" "}
            <span id="hdrDone">
              {completedPhases.length}
            </span>
            {" / "}
            <span id="hdrTotal">
              {labData.phases.length}
            </span>
          </div>
        </div>
      </div>
      {/* MAIN */}
      <div className={styles.labMain}>
        {/* SIDEBAR */}
        <div
          className={[
            styles.labSidebar,
            sidebarOpen ? styles.open : ""
          ].join(" ")}
        >

          <div className={styles.sidebarHd}>
            <span> // PHASES </span>
            <span className={styles.sidebarHdRight}>
              {completedPhases.length}/
              {labData.phases.length}
            </span>
          </div>
          <div className={styles.phaseScroll}>
            {labData.phases.map(
              (item, index) => (
                <button
                  key={item.id}
                  className={[
                    styles.phaseItem,
                    currentPhase===index ? styles.active : "",
                    completedPhases.includes(index) ? styles.done : ""
                  ].join(" ")}
                  onClick={() => {
                    setCurrentPhase(index);
                    setSidebarOpen(false);
                  }}
                >
                  <div className={styles.phaseBadge}>
                    {String(item.id).padStart( 2, "0" )}
                  </div>
                  <div className={styles.phaseInfo}>
                    <div className={styles.phaseName}>
                      {item.title}
                    </div>
                    <div className={styles.phaseSubtitle}>
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              )
            )}
          </div>
          <div className={styles.sidebarFooter}>
            <button className={styles.stuckButton}>
              <div className={styles.stuckIconWrap}> 💬 </div>
              <div className={styles.stuckTxt}>
                <div className={styles.stuckLabel}>  GOT STUCK? </div>
                <div className={styles.stuckSub}> Contact admin </div>
              </div>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.labContent}>
          <div className={styles.contentHd}>
            <div className={styles.breadcrumb}>
              LAB-{labData.id}
              <span className={styles.breadcrumbSeparator}> // </span>
              <span className={styles.breadcrumbActive}> PHASE {phase.id} </span>
            </div>
            <div className={styles.contentCounter}>
              PHASE {phase.id} /
              {labData.phases.length}
            </div>
          </div>
          <div className={styles.contentBody}>
            <div className={styles.phaseTitle}>
              PHASE {phase.id} — {phase.title}
            </div>
            <div className={styles.phaseSubtitle}>
              {phase.subtitle}
            </div>
            {phase.blocks.map(
              (block, i) => (
                <div
                  key={i}
                  className={styles.sectionBlock}
                >
                  {block.title && (
                    <div className={styles.sectionLabel}>
                      // {block.title}
                    </div>
                  )}
                  {renderBlock(block)}
                </div>
              )
            )}
            <div className={styles.phaseActions}>

              <button
                className={[
                  styles.actionButton,
                  styles.completeButton,
                  completedPhases.includes(currentPhase)
                  ? styles.doneState
                  : ""
                ].join(" ")}
                onClick={
                  handleCompletePhase
                }
              >
                {
                  completedPhases.includes(
                    currentPhase
                  )
                    ? "✓ COMPLETED"
                    : "▶ MARK COMPLETE"
                }
              </button>
              <button
                className={[
                  styles.actionButton,
                  styles.resetButton
                  ].join(" ")}
                onClick={() => {
                
                  setCompletedPhases(
                    completedPhases.filter(
                      (item) =>
                        item !== currentPhase
                    )
                  );
                
                }}
              >
                ↺ RESET

              </button>                      
            </div>
          </div>
          <div className={styles.contentFooter}>
            <div className={styles.footerDots}>
              {labData.phases.map(
                (_, index) => (
                  <div
                    key={index}
                    className={[
                      styles.footerDot,
                      completedPhases.includes(index)?styles.done:"",
                      currentPhase===index?styles.active:""
                    ].join(" ")}
                  />
                )
              )}
            </div>
            <div className={styles.footerNav}>
              <button
                className={[
                  styles.navButton,
                  styles.prev
                ].join(" ")}
                disabled={currentPhase === 0}
                onClick={() =>
                  setCurrentPhase(
                    currentPhase - 1
                  )
                }
              >
                ◄ PREV
              </button>
              <button
                className={[
                  styles.navButton,
                  styles.next
                ].join(" ")}
                disabled={
                  currentPhase ===
                  labData.phases.length - 1
                }
                onClick={() =>
                  setCurrentPhase(
                    currentPhase + 1
                  )
                }
              >
                NEXT ►
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
        <div className={styles.ilabFooter}>
          <span>© 2026 Cyber Learning</span>
          <span>LAB {labData.id} · ACTIVE</span>
        </div>
    </div>
  );

}