import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import styles from "../styles/Home.module.css";
import { useReveal } from "../animations/useReveal";

import HomeHeroSection from "../sections/home/HomeHeroSection";
import SectionHeader from "../components/SectionHeader";
import ModuleCard from "../components/ModuleCard";
import TestCard from "../components/TestCard";
import PracticalCard from "../components/PracticalCard";
import FinalChallengeCard from "../components/FinalChallengeCard";




const MODULES = [
  {
    id: 1, icon: 'shield',
    tag: 'FUNDAMENTALS', title: 'Cybersec\nBasics',
    desc: 'Learn the fundamentals of cybersecurity, threats, and defense strategies.',
    topics: ['FUNDAMENTALS', 'HACKING', 'SECURITY'],
  },
  {
    id: 2, icon: 'hack',
    tag: 'ETHICAL HACKING', title: 'Ethical Hacking\nBasics',
    desc: 'Explore penetration testing, vulnerability analysis, and ethical hacking principles.',
    topics: ['ATTACKS', 'TOOLS', 'TERMINOLOGIES'],
  },
  {
    id: 3, icon: 'terminal',
    tag: 'LINUX', title: 'Terminal\nBasics',
    desc: 'Master the command line to interact efficiently with systems.',
    topics: ['LINUX', 'NETWORKING', 'FILE OPERATIONS'],
  },
  {
    id: 4, icon: 'attack',
    tag: 'ATTACKS', title: 'Attacks\nBasics',
    desc: 'Understand common cyber attacks and how they work.',
    topics: ['ATTACK TYPES'],
  },
  {
    id: 5, icon: 'tools',
    tag: 'TOOLS', title: 'Tools\nBasics',
    desc: 'Get familiar with cybersecurity tools for testing and defense.',
    topics: ['SCANNING', 'ENUMERATION', 'ESCALATION'],
  },
];

export default function Home() {

  const navigate = useNavigate();
  const rootRef = useRef(null);
  useReveal(rootRef);

  return (
    <>
    <div ref={rootRef}>
      <div id="banner">
        <HomeHeroSection />
      </div>
      

      {/* LEVEL 1 */}
      <SectionHeader level="LEVEL 1" title="CORE MODULES" />
      <div id="modules" className={styles.moduleSection}>
        <div className={styles.moduleGrid} data-stagger-children>
          {MODULES.map(m => (
            <ModuleCard key={m.id} {...m}
            onStart={()=> navigate(`/module/${m.id}`)} />
          ))}
        </div>
      </div>

      {/* LEVEL 2 */}
      <SectionHeader level="LEVEL 2" title="KNOWLEDGE CHECKPOINT" />
      <div id="checkpoint" className={styles.testSection}>
        <div className={styles.testGrid} data-stagger-children>
          <TestCard moduleNumber="1" moduleName="CYBERSEC BASICS" category="FUNDAMENTALS" status="unlocked" progress={0} score={0} mcqPath="/quiz/1" />
          <TestCard moduleNumber="2" moduleName="ETHICAL HACKING BASICS" category="ETHICAL HACKING" status="unlocked" progress={0} score={0} mcqPath="/quiz/2" />
          <TestCard moduleNumber="3" moduleName="TERMINAL BASICS" category="LINUX" status="unlocked" progress={0} score={0} mcqPath="/quiz/3" />
          <TestCard moduleNumber="4" moduleName="ATTACKS BASICS" category="ATTACKS" status="unlocked" progress={0} score={0} mcqPath="/quiz/4" />
          <TestCard moduleNumber="5" moduleName="TOOLS BASICS" category="TOOLS" status="unlocked" progress={0} score={0} mcqPath="/quiz/5" />
        </div>
      </div>

      {/* LEVEL 3 */}
      <SectionHeader level="LEVEL 3" title="HANDS-ON PRACTICAL" />
          <div id="practical" className={styles.practicalSection} data-reveal-scroll>
            <PracticalCard
              title="PRACTICAL HACKING LABS"
              subtitle="Execute structured attack flows and refine your tactics before entering high-stakes CTF environments."
              onStart={() => navigate("/labs")}
            />
          </div>


        {/* LEVEL 4 */}
        <SectionHeader level="LEVEL 4" title="FINAL CHALLENGE" />
          <div id="ctf" data-reveal-scroll>
            <FinalChallengeCard
              onStart={() => navigate("/ctf")}
            />
          </div>

        <footer className={styles.footer}>
          <div className={styles.footerBottom}>
            <div className={styles.footerTitle}>Crucible</div>
            <div className={styles.footerTagline}>Train. Exploit. Secure.</div>
            © 2026 Crucible • Built for ethical hackers.
          </div>
        </footer>

        

    </div>

    </>

  );
}