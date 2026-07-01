import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CyberButton from "../components/CyberButton";
import AccessDeniedModal from "../components/AccessDeniedModal";
import TestResultModal from "../components/TestResultModal";
import PlayIcon from "../components/Icons/PlayIcon";
import styles from "../styles/Test.module.css";

const TIME_LIMIT = 30;
const MAX_LIVES = 3;

const moduleMap = {
  1: "Cybersec Basics",
  2: "Ethical Hacking Basics",
  3: "Terminal Basics",
  4: "Attacks Basics",
  5: "Tools Basics",
};

export default function TestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [moduleName, setModuleName] = useState("");

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // LOAD DATA
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/data/6/questions/m${id}.json`);
        const data = await res.json();
        setQuestions(data);
        setModuleName(moduleMap[id] || "Unknown Module");
      } catch (err) {
        console.error("Failed to load questions", err);
      }
    }
    load();
  }, [id]);

  // LOCK CHECK
  useEffect(() => {
    const saved = localStorage.getItem(`lock-${id}`);
    if (saved && Date.now() < parseInt(saved)) {
      setLockedUntil(parseInt(saved));
    }
  }, [id]);

  // TIMER
  useEffect(() => {
    if (answered || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleWrong();
          return TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answered, showResult]);

  if (!questions.length) {
    return <div className={styles.modLoading}>Loading...</div>;
  }

  // LOCK SCREEN
  if (lockedUntil && Date.now() < lockedUntil) {
    return (
      <AccessDeniedModal
        testId={id}
        duration={0.083}
        onClose={() => navigate("/")}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // RESULT MODAL (CLEAN SWITCH)
  if (showResult) {
    return (
      <TestResultModal
        testId={id}
        score={score}
        correct={score / 100}
        wrong={questions.length - score / 100}
        total={questions.length}
        onRetry={() => window.location.reload()}
        onClose={() => navigate("/")}
        avgTime={Math.round(timeSpent / questions.length)}
      />
    );
  }

  const q = questions[current];

  function handleAnswer(index) {
    if (answered) return;

    setSelected(index);
    setAnswered(true);

    if (index === q.correct_option) {
      setScore(prev => prev + 100);
    } else {
      handleWrong();
    }
  }

  function handleWrong() {
    setLives(prev => {
      const newLives = prev - 1;

      if (newLives <= 0) {
        const lockTime = Date.now() + 5000;
        localStorage.setItem(`lock-${id}`, lockTime);
        setLockedUntil(lockTime);
      }

      return newLives;
    });
  }

  //  FIXED FLOW
  function nextQuestion() {

  setTimeSpent(prev => prev + (TIME_LIMIT - timeLeft));

  if (current === questions.length - 1) {
    finishTest();
  } else {
    setCurrent(prev => prev + 1);
    setSelected(null);
    setAnswered(false);
    setTimeLeft(TIME_LIMIT);
  }

}

  function finishTest() {
    const correct = score / 100;
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const avgTime = Math.round(timeSpent / questions.length);

    localStorage.setItem(`test-result-${id}`, JSON.stringify({
      score,
      correct,
      wrong: total - correct,
      total,
      pct,
      avgTime,
      passed: pct >= 70
    }));

    setShowResult(true);
  }

  return (
    <div className={styles.pageWrap}>
      
      {/* HEADER */}
      <div className={styles.testHeader}>

        {/* ROW 1 */}
        <div className={`${styles.headerRow} ${styles.headerRowTop}`}>
           <div className={styles.modLabel}>
             LEVEL 2 KNOWLEDGE CHECKPOINT
           </div>

          <CyberButton
            onClick={() => navigate("/")}
            icon={<PlayIcon style={{ transform: "rotate(180deg)" }} />}
          >
            BACK
          </CyberButton>
        </div>

        {/* ROW 2 */}
        <div className={`${styles.headerRow} ${styles.headerRowBottom}`}>

          <div className={styles.headerTitle}>
            {moduleName}
          </div>

          <div className={styles.moduleTag}>
            MOD-{String(id).padStart(2, "0")}
          </div>

        </div>
      </div>

      {/* MCQ CARD */}
      <div className={styles.mcqCard}>
        <div className={styles.cBl}></div>
        <div className={styles.cBr}></div>

        {/* STATS */}
        <div className={styles.stats}>
          <div>Score: {score}</div>
          <div className={styles.questionCounter}>
            {current + 1} / {questions.length}
          </div>

          <div className={styles.integrity}>
            <div className={styles.statLabel}>LIVES</div>
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span
                key={i}
                className={[
                  styles.block,
                  i < lives ? styles.active : ""
                ].join(" ")}
              />
            ))}
          </div>
        </div>

        {/* TIMER */}
        <div className={styles.timerWrap}>
          <div className={styles.timer}>Time:</div>
          <div className={styles.timerTrack}>
            <div
              className={styles.timerFill}
              style={{
                width: `${(timeLeft / TIME_LIMIT) * 100}%`
              }}
            />
          </div>
          {timeLeft}s
        </div>

        {/* QUESTION */}
        <div className={styles.question}>{q.question}</div>

        {/* OPTIONS */}
        <div className={styles.options}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={[
                styles.option,
                answered && i === q.correct_option ? styles.correct : "",
                answered && i === selected && i !== q.correct_option
                  ? styles.wrong
                  : ""
              ].join(" ")}
              onClick={() => handleAnswer(i)}
            >
              <div className={styles.optionInner}>
                <span className={styles.optionLabel}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={styles.optionText}>{opt}</span>
              </div>
            </button>
          ))}
        </div>

        {/* NEXT */}
        {answered && (
          <div className={styles.nextButtonWrap}>
            <CyberButton onClick={nextQuestion}>
              NEXT
            </CyberButton>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className={styles.tstFooter}>
        <span>© 2026 Cyber Learning</span>
        <span>MODULE {id} · ACTIVE</span>
      </div>
    </div>
  );
}