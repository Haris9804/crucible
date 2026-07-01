import { useEffect, useRef, useState } from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import {
  getLabProgress,
  saveLabProgress
} from "../utils/labProgress";

import styles from "../styles/IndividualLab.module.css";
import { useReveal } from "../animations/useReveal";
import CyberButton from "../components/CyberButton";

import lab1 from "../data/labs/lab1.json";
import lab2 from "../data/labs/lab2.json";
import lab3 from "../data/labs/lab3.json";
import lab4 from "../data/labs/lab4.json";

// Replace these fallback values with the real admin contact details,
// or define VITE_ADMIN_WHATSAPP_NUMBER and VITE_ADMIN_EMAIL in your .env file.
const ADMIN_WHATSAPP_NUMBER =
  import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER || "919XXXXXXXXX";
const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com";

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
  useState(() => getLabProgress(labId).completedPhases);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const contentRef = useRef(null);
  useReveal(contentRef, [currentPhase]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setContactOpen(false);
      }
    }

    function handleResize() {
      if (window.innerWidth > 900) {
        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
  const savedProgress = getLabProgress(labId);

  setCompletedPhases(
    Array.isArray(savedProgress.completedPhases)
      ? savedProgress.completedPhases
      : []
  );

  setCurrentPhase(0);
}, [labId]);

  useEffect(() => {
    const mobileSidebarOpen = sidebarOpen && window.innerWidth <= 900;

    if (!mobileSidebarOpen && !contactOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen, contactOpen]);

  if (!labData) {

    return (
      <div className={styles.pageWrap}>
        <div className={styles.labContent}>
          <div className={styles.contentBody}>
            <div className={styles.phaseTitle}>
              LAB NOT FOUND
            </div>
          </div>
        </div>
      </div>
    );
  }

  const phase =
    labData.phases[currentPhase];

  const supportMessage =
    `Hello Admin, I need help with LAB-${labData.id} (${labData.title}), ` +
    `Phase ${phase.id}: ${phase.title}.`;

  const whatsappUrl =
    `https://wa.me/${ADMIN_WHATSAPP_NUMBER.replace(/\D/g, "")}` +
    `?text=${encodeURIComponent(supportMessage)}`;

  const emailUrl =
    `mailto:${ADMIN_EMAIL}` +
    `?subject=${encodeURIComponent(`Help required for LAB-${labData.id}`)}` +
    `&body=${encodeURIComponent(supportMessage)}`;
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
  if (completedPhases.includes(currentPhase)) {
    return;
  }

  const updatedPhases = [
    ...completedPhases,
    currentPhase
  ];

  setCompletedPhases(updatedPhases);

  saveLabProgress(
    labData.id,
    updatedPhases,
    labData.phases.length
  );
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
          <div className={styles.stepsWrap}>
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
                <button type="button"
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
    <>
      {sidebarOpen && (
        <button
          type="button"
          className={`${styles.sidebarOverlay} ${styles.active}`}
          aria-label="Close phase navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {contactOpen && (
        <div
          className={styles.contactOverlay}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setContactOpen(false);
            }
          }}
        >
          <section
            className={styles.contactModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-admin-title"
          >
            <div className={styles.contactModalHeader}>
              <div>
                <div className={styles.contactEyebrow}>// SUPPORT CHANNEL</div>
                <h2 id="contact-admin-title" className={styles.contactTitle}>
                  CONNECT WITH ADMIN
                </h2>
              </div>

              <button
                type="button"
                className={styles.contactModalClose}
                aria-label="Close contact options"
                onClick={() => setContactOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className={styles.contactDescription}>
              Choose a contact method. The lab and current phase details will be
              included automatically.
            </p>

            <div className={styles.contactOptions}>
              <a
                className={`${styles.contactOption} ${styles.whatsappOption}`}
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setContactOpen(false)}
              >
                <span className={styles.contactOptionIcon}>◉</span>
                <span className={styles.contactOptionText}>
                  <strong>WHATSAPP</strong>
                  <small>Open admin chat</small>
                </span>
                <span className={styles.contactOptionArrow}>►</span>
              </a>

              <a
                className={`${styles.contactOption} ${styles.emailOption}`}
                href={emailUrl}
                onClick={() => setContactOpen(false)}
              >
                <span className={styles.contactOptionIcon}>✉</span>
                <span className={styles.contactOptionText}>
                  <strong>EMAIL</strong>
                  <small>Open your email application</small>
                </span>
                <span className={styles.contactOptionArrow}>►</span>
              </a>
            </div>
          </section>
        </div>
      )}

      <div className={styles.pageWrap}>
      {/* HEADER */}
      <div className={styles.labHeader}>
        <CyberButton
          type="button"
          className={styles.headerBackButton}
          onClick={() => navigate(-1)}
        >
          ◄ BACK
        </CyberButton>
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
            type="button"
            className={styles.menuBtn}
            aria-label={sidebarOpen ? "Close phase navigation" : "Open phase navigation"}
            aria-expanded={sidebarOpen}
            aria-controls="lab-phase-sidebar"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? "✕" : "☰"}
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
        <aside
          id="lab-phase-sidebar"
          className={[
            styles.labSidebar,
            sidebarOpen ? styles.open : ""
          ].join(" ")}
        >

          <div className={styles.sidebarHd}>
            <span>// PHASES</span>

            <div className={styles.sidebarHdActions}>
              <span className={styles.sidebarHdRight}>
                {completedPhases.length}/{labData.phases.length}
              </span>

              <button
                type="button"
                className={styles.sidebarClose}
                aria-label="Close phase navigation"
                onClick={() => setSidebarOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>
          <div className={styles.phaseScroll}>
            {labData.phases.map(
              (item, index) => (
                <button type="button"
                  key={item.id}
                  className={[
                    styles.phaseItem,
                    currentPhase === index ? styles.active : "",
                    completedPhases.includes(index) ? styles.done : ""
                  ].join(" ")}
                  aria-current={currentPhase === index ? "step" : undefined}
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
                    <div className={styles.phaseItemSubtitle}>
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              )
            )}
          </div>
          <div className={styles.sidebarFooter}>
            <button
              type="button"
              className={styles.stuckButton}
              aria-haspopup="dialog"
              onClick={() => {
                setSidebarOpen(false);
                setContactOpen(true);
              }}
            >
              <div className={styles.stuckIconWrap}>💬</div>
              <div className={styles.stuckTxt}>
                <div className={styles.stuckLabel}>GOT STUCK?</div>
                <div className={styles.stuckSub}>Connect with admin</div>
              </div>
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <div className={styles.labContent} ref={contentRef}>
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
          <div className={styles.contentBody} data-reveal>
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
                      
                    </div>
                  )}
                  {renderBlock(block)}
                </div>
              )
            )}
            <div className={styles.phaseActions}>

              <button type="button"
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
              <button type="button"
                className={[
                  styles.actionButton,
                  styles.resetButton
                  ].join(" ")}
                onClick={() => {
  const updatedPhases = completedPhases.filter(
    (phaseIndex) => phaseIndex !== currentPhase
  );

  setCompletedPhases(updatedPhases);

  saveLabProgress(
    labData.id,
    updatedPhases,
    labData.phases.length
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
               <div className={styles.btn}>
                                    <div className={styles.prvBtn}>
                                     <CyberButton
  disabled={currentPhase === 0}
  onClick={() => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  }}
>
  ◀ PREV
</CyberButton>
                                  </div>
                                    <div className={styles.nxtBtn}>
                                      <CyberButton
  disabled={currentPhase === labData.phases.length - 1}
  onClick={() => {
    if (currentPhase < labData.phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  }}
>
  NEXT ▶
</CyberButton>
                                    </div>
                                  </div>
                                  
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
    </>
  );

}