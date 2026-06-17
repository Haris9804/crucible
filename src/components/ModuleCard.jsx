import { useRef } from 'react';
import CyberButton from '../components/CyberButton';
import PlayIcon from "./Icons/PlayIcon";

import styles from "../styles/Home.module.css";



const ICONS = {
  shield: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 4L8 14V32C8 46 18 58 32 62C46 58 56 46 56 32V14L32 4Z" stroke="#A1FFC2" strokeWidth="3" fill="rgba(0,255,65,0.06)"/>
      <path d="M22 32L28 38L42 24" stroke="#A1FFC2" strokeWidth="3" strokeLinecap="square"/>
      <rect x="30" y="18" width="4" height="14" fill="#A1FFC2"/>
      <rect x="30" y="34" width="4" height="4" fill="#A1FFC2"/>
    </svg>
  ),
  hack: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="48" height="36" rx="0" stroke="#A1FFC2" strokeWidth="3" fill="rgba(0,255,65,0.06)"/>
      <rect x="24" y="46" width="16" height="4" fill="#A1FFC2"/>
      <rect x="16" y="50" width="32" height="3" fill="#A1FFC2"/>
      <path d="M18 24L24 30L18 36" stroke="#A1FFC2" strokeWidth="2.5" strokeLinecap="square"/>
      <rect x="28" y="33" width="14" height="3" fill="#A1FFC2"/>
    </svg>
  ),
  terminal: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="52" height="44" stroke="#A1FFC2" strokeWidth="3" fill="rgba(0,255,65,0.06)"/>
      <rect x="6" y="10" width="52" height="10" fill="rgba(0,255,65,0.12)"/>
      <rect x="12" y="13" width="4" height="4" fill="#ff3c3c"/>
      <rect x="20" y="13" width="4" height="4" fill="#ffaa00"/>
      <rect x="28" y="13" width="4" height="4" fill="#A1FFC2"/>
      <path d="M14 32L22 38L14 44" stroke="#A1FFC2" strokeWidth="2.5" strokeLinecap="square"/>
      <rect x="26" y="41" width="20" height="3" fill="#A1FFC2"/>
    </svg>
  ),
  attack: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" stroke="#A1FFC2" strokeWidth="3" fill="rgba(0,255,65,0.06)"/>
      <circle cx="32" cy="32" r="14" stroke="#A1FFC2" strokeWidth="1.5" strokeDasharray="4 3"/>
      <circle cx="32" cy="32" r="6" stroke="#A1FFC2" strokeWidth="1.5"/>
      <line x1="32" y1="6" x2="32" y2="14" stroke="#A1FFC2" strokeWidth="3"/>
      <line x1="32" y1="50" x2="32" y2="58" stroke="#A1FFC2" strokeWidth="3"/>
      <line x1="6" y1="32" x2="14" y2="32" stroke="#A1FFC2" strokeWidth="3"/>
      <line x1="50" y1="32" x2="58" y2="32" stroke="#A1FFC2" strokeWidth="3"/>
      <circle cx="32" cy="32" r="2" fill="#ff3c3c"/>
    </svg>
  ),
  tools: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 50L28 36" stroke="#A1FFC2" strokeWidth="3" strokeLinecap="square"/>
      <rect x="26" y="28" width="6" height="12" transform="rotate(-45 26 28)" stroke="#A1FFC2" strokeWidth="2.5" fill="rgba(0,255,65,0.1)"/>
      <circle cx="44" cy="20" r="10" stroke="#A1FFC2" strokeWidth="3" fill="rgba(0,255,65,0.06)"/>
      <path d="M38 20H50M44 14V26" stroke="#A1FFC2" strokeWidth="2.5"/>
      <rect x="8" y="46" width="14" height="6" stroke="#A1FFC2" strokeWidth="2" fill="rgba(0,255,65,0.06)"/>
    </svg>
  ),
};

export default function ModuleCard({
  id,
  icon,
  tag,
  title,
  desc = '',
  topics = [],
  completed = false,
  locked = false,
  onStart, // ✅ renamed
}) {
  const cardClass = [
    styles.moduleCard,
    completed ? 'styles.completed' : '',
    locked ? 'styles.locked' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className={styles.mcBl}  /><div className={styles.mcBr}/>

      <div className={styles.cardIconArea}>
        <div className={styles.cardIcon}>{ICONS[icon]}</div>
        <div className={styles.thumbNum}>{String(id).padStart(2, '0')}</div>
        {completed && <div className={styles.thumbDone}>✓</div>}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTag}>{tag}</div>

        <div className={styles.cardHeading}>
          {title.split('\n').map((l, i) => (
            <span key={i}>
              {l}
              {i < title.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {desc && <div className={styles.cardSubHeading}>{desc}</div>}

        {topics.length > 0 && (
          <div className={styles.cardTopics}>
            {topics.map(t => (
              <span key={t} className={styles.topicChip}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <CyberButton
          icon={<PlayIcon />}
          onClick={(e) => {
            e.stopPropagation();
            if (!locked && onStart) onStart();
          }}
          disabled={locked}
        >
          START
        </CyberButton>
      </div>
    </div>
  );
}