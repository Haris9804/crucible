import { useEffect, useRef, useState } from "react";
import  styles from "../styles/Modules.module.css"

import { useParams, useNavigate } from "react-router-dom";
import CyberButton from "../components/CyberButton";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../animations/useReveal";

import PlayIcon from "../components/Icons/PlayIcon";

export default function ModulePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openChapter, setOpenChapter] = useState(0);

  const contentRef = useRef(null);

  // Card-to-card content transition. Keyed to the active card, but built to stay
  // readable under rapid PREV/NEXT: it never drops below ~50% opacity, has no
  // skew, kills any in-flight tween (overwrite), and clears inline styles on
  // finish so the resting state is always full opacity — even when interrupted.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const body = contentRef.current?.querySelector("[data-reveal]");
      if (!body) return;
      gsap.fromTo(
        body,
        { opacity: 0.5, y: 14 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", overwrite: true, clearProps: "opacity,transform" }
      );
    },
    { scope: contentRef, dependencies: [chapterIndex, cardIndex] }
  );

  // LOAD DATA
  useEffect(() => {
    async function loadAll() {
      const loaded = [];
      for (let i = 1; i <= 10; i++) {
        try {
          const res = await fetch(`/data/${id}/chapter${i}.json`);
          if (!res.ok) break;
          const data = await res.json();
          loaded.push(data);
        } catch {
          break;
        }
      }
      setChapters(loaded);
      setLoading(false);
      setOpenChapter(0);
    }
    loadAll();
  }, [id]);

  useEffect(() => {
    setOpenChapter(chapterIndex);
  }, [chapterIndex]);

  if (loading)
    return <div className={styles.modLoading}>Loading...</div>;

  if (chapters.length === 0)
    return <div className={styles.modLoading}>No content</div>;

  const chapter = chapters[chapterIndex];
  const cards = chapter.cards || [];
  const card = cards[cardIndex];

  // KEY FIX
  const isCommandModule = !!card.main_commands;

  return (
    <>
      <div
        className={[
         styles.sidebarOverlay,
         sidebarOpen ? styles.active : ""
        ].join(" ")}
      />

      <div className={styles.pageWrap}>

        {/* HEADER */}
        <div className={styles.modHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.modLabel}>LEVEL 1 · CORE MODULES</div>
            <div className={styles.modTitle}>MODULE {id}</div>
            <div className={styles.modName}>{chapter.chapter_title}</div>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <CyberButton
              onClick={() => navigate("/")}
              
            >
              ◀ BACK
            </CyberButton>
          </div>
        </div>

        {/* MAIN */}
        <div className={styles.modMain}>

          {/* SIDEBAR */}
          <div 
            className={[
              styles.modSidebar,
              sidebarOpen ? styles.open : ""
            ].join(" ")}
          >

            <div className={styles.sidebarHead}>// CONTENTS</div>

            <div className={styles.sidebarScroll}>
              {chapters.map((ch, ci) => (
                <div key={ci} className={styles.chapter}>

                  <button
                    className={[
                      styles.chapterToggle,
                      openChapter === ci ? styles.open : ""
                    ].join(" ")}
                    onClick={() => setOpenChapter(ci)}
                  >
                    <span className={styles.chArrow}>▶</span>
                    {ch.chapter_title}
                  </button>

                  <div 
                    className={[
                      styles.topicList,
                      openChapter === ci ? styles.open : ""
                    ].join(" ")}>
                    {(ch.cards || []).map((c, ti) => {
                      const isActive = ci === chapterIndex && ti === cardIndex;
                      const isDone =
                        ci < chapterIndex ||
                        (ci === chapterIndex && ti < cardIndex);

                      return (
                        <button
                          key={ti}
                          className={[
                            styles.topicItem,
                            isActive ? styles.active : "",
                            isDone ? styles.done : ""
                          ].join(" ")}
                          onClick={() => {
                            setChapterIndex(ci);
                            setCardIndex(ti);
                            setSidebarOpen(false);
                          }}
                        >
                          {c.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div className={styles.modContent} ref={contentRef}>
            {card && (
              <>
                <div className={styles.contentHead}>
                  <div className={styles.contentBreadcrumb}>
                    MODULE {id} // {chapter.chapter_title}
                  </div>
                </div>

                <div className={styles.contentBody} data-reveal>

                  <div className={styles.topicTitle}>{card.title}</div>

                  <div className={styles.topicSubtitle}>
                    Chapter {chapterIndex + 1} // Topic {cardIndex + 1}
                  </div>

                  {/* THEORY MODULE */}
              
                  {!isCommandModule && (
                    <>
                      <div className={styles.contentSectionTheory}>
                        <p>{card.description_long}</p>
                      </div>

                      <div className={styles.contentSectionPoints}>
                        <div className={styles.sectionLabel}>// KEY POINTS</div>
                        <ul>
                          {card.main_points?.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={styles.contentSectionExample}>
                        <div className={styles.sectionLabel}>// EXAMPLE</div>
                        <pre>{card.example}</pre>
                      </div>
                    </>
                  )}

                  {/* 🟢 COMMAND MODULE */}

                  {isCommandModule && (
                    <>
                      <div className={styles.contentSectionTheory}>
                        <p>{card.description_long}</p>
                      </div>

                      

                      {/* COMMAND TABLE */}
                      <div className={styles.cmdSectionLabel}>// COMMANDS</div>

                      <div className={styles.contentSectionTitle}>
                        {card.title} —  {card.description_short.toUpperCase()}
                    </div>

                      <table className={styles.cmdTable}>
                        <thead>
                          <tr>
                            <th>COMMAND</th>
                            <th>EXPLANATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {card.main_commands.map((cmd, i) => (
                            <tr key={i}>
                              <td className={styles.cmdCell}>{cmd.command}</td>
                              <td className={styles.expCell}>{cmd.explanation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* ACTIVITIES */}
                      <div className={styles.cmdSectionLabel}>// PRACTICE ACTIVITIES</div>

                      <div className={styles.activityList}>
                        {card.activity.map((act, i) => (
                          <div key={i} className={styles.activityItem}>
                            <span className={styles.aiNum}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {act}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                </div>

                {/* FOOTER */}
                <div className={styles.contentFooter}>
                  <div className={styles.cfRight}>
                    <div className={styles.btn}>
                      <div className={styles.prvBtn}>
                        <CyberButton
                      onClick={() => {
                        if (cardIndex > 0) {
                          setCardIndex(cardIndex - 1);
                        } else if (chapterIndex > 0) {
                          const prev = chapters[chapterIndex - 1];
                          setChapterIndex(chapterIndex - 1);
                          setCardIndex((prev.cards || []).length - 1);
                        }
                      }}
                    >
                      ◀ PREV
                    </CyberButton>
                    </div>
                      <div className={styles.nxtBtn}>
                        <CyberButton
                      onClick={() => {
                        if (cardIndex < cards.length - 1) {
                          setCardIndex(cardIndex + 1);
                        } else if (chapterIndex < chapters.length - 1) {
                          setChapterIndex(chapterIndex + 1);
                          setCardIndex(0);
                        }
                      }}
                    >
                      NEXT ▶
                    </CyberButton>
                      </div>
                    </div>
                    

                    

                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className={styles.modFooter}>
          <span>© 2026 Cyber Learning</span>
          <span>MODULE {id} · ACTIVE</span>
        </div>

      </div>
    </>
  );
} 