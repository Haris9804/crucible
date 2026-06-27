import { useEffect, useState, useCallback } from 'react';
import styles from "../styles/Home.module.css";

const SECTIONS = [
  { id: 'banner',     icon: '⌂', label: 'BANNER',  badge: 'HOME' },
  { id: 'modules',    icon: '◈', label: 'MODULES', badge: 'L1'   },
  { id: 'checkpoint', icon: '▣', label: 'TESTS',   badge: 'L2'   },
  { id: 'practical',  icon: '⚙', label: 'LABS',    badge: 'L3'   },
  { id: 'ctf',        icon: '⚑', label: 'CTF',     badge: 'L4'   },
];

export default function FloatingNav() {
  const [active,   setActive]   = useState('banner');
  const [progress, setProgress] = useState(0);

  /* ── active section via IntersectionObserver ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  /* ── scroll progress bar ── */
  const handleScroll = useCallback(() => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    setProgress(maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* ── smooth scroll helpers ── */
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={styles.floatNav} aria-label="Page sections">

      {/* pixel corner accents */}
      <span className={styles.cornerTR} aria-hidden="true" />
      <span className={styles.cornerBL} aria-hidden="true" />

      {/* scroll progress line */}
      <div
        className={styles.progressBar}
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      {/* section buttons */}
      {SECTIONS.map((sec, i) => (
        <span key={sec.id} className={styles.btnGroup}>
          <button
            className={`${styles.navBtn} ${active === sec.id ? styles.active : ''}`}
            onClick={() => scrollToSection(sec.id)}
            title={sec.label}
            aria-current={active === sec.id ? 'location' : undefined}
          >
            <span className={styles.badge}  aria-hidden="true">{sec.badge}</span>
            <span className={styles.icon}   aria-hidden="true">{sec.icon}</span>
            <span className={styles.label}>{sec.label}</span>
          </button>

          {/* separator between every button except the last */}
          {i < SECTIONS.length - 1 && (
            <span className={styles.sep} aria-hidden="true" />
          )}
        </span>
      ))}

      {/* scroll to top */}
      <button
        className={styles.topBtn}
        onClick={scrollToTop}
        title="Back to top"
        aria-label="Scroll to top"
      >
        <span className={styles.topIcon} aria-hidden="true">↑</span>
        <span className={styles.topLabel}>TOP</span>
      </button>

    </nav>
  );
}