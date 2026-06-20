import '../styles/globals.css';
import styles from "../styles/Home.module.css";

export default function SectionHeader({ level, title }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.shLine} />
      <span className={styles.sectionLevel}>{level}</span>
      <span className={styles.sectionTitle} data-glitch>{title}</span>
      <div className={styles.shLine} />
    </div>
  );
}
