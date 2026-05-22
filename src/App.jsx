import { useEffect, useMemo, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import ProgressRail from "./components/ProgressRail.jsx";
import QuestionPanel from "./components/QuestionPanel.jsx";
import InsightPanel from "./components/InsightPanel.jsx";
import ResultView from "./components/ResultView.jsx";
import { defaultThemeId, isValidTheme } from "./data/themes.js";
import { questions } from "./data/assessment.js";
import { calculateScores, getCompletion, getFirstUnansweredIndex, getSummary } from "./utils/scoring.js";
import usePrefersReducedMotion from "./hooks/usePrefersReducedMotion.js";

const storageKey = "personality-assessment-theme";
const answerStorageKey = "personality-assessment-answers";
const indexStorageKey = "personality-assessment-current-index";

function getInitialTheme() {
  const stored = window.localStorage.getItem(storageKey);
  return isValidTheme(stored) ? stored : defaultThemeId;
}

function getInitialAnswers() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(answerStorageKey) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getInitialQuestionIndex() {
  const stored = Number(window.localStorage.getItem(indexStorageKey));
  return Number.isInteger(stored) && stored >= 0 && stored < questions.length ? stored : 0;
}

export default function App() {
  const [answers, setAnswers] = useState(getInitialAnswers);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(getInitialQuestionIndex);
  const [themeId, setThemeId] = useState(getInitialTheme);
  const [view, setView] = useState("assessment");
  const [motionDirection, setMotionDirection] = useState("forward");
  const prefersReducedMotion = usePrefersReducedMotion();

  const completion = useMemo(() => getCompletion(answers), [answers]);
  const previewScores = useMemo(() => calculateScores(answers, { preview: true }), [answers]);
  const finalScores = useMemo(() => calculateScores(answers), [answers]);
  const summary = useMemo(() => getSummary(finalScores), [finalScores]);
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    window.localStorage.setItem(storageKey, themeId);
  }, [themeId]);

  useEffect(() => {
    window.localStorage.setItem(answerStorageKey, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    window.localStorage.setItem(indexStorageKey, String(currentQuestionIndex));
  }, [currentQuestionIndex]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (view !== "assessment") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const value = Number(event.key);
      if (value >= 1 && value <= 5) {
        setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
      }
      if (event.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setMotionDirection("backward");
        setCurrentQuestionIndex((index) => index - 1);
      }
      if (event.key === "ArrowRight" && answers[currentQuestion.id] && currentQuestionIndex < questions.length - 1) {
        setMotionDirection("forward");
        setCurrentQuestionIndex((index) => index + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answers, currentQuestion, currentQuestionIndex, view]);

  function handleThemeChange(nextThemeId) {
    setThemeId(nextThemeId);
  }

  function handleAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function handlePrevious() {
    setMotionDirection("backward");
    setCurrentQuestionIndex((index) => Math.max(0, index - 1));
  }

  function handleNext() {
    if (!answers[currentQuestion.id]) return;
    setMotionDirection("forward");
    setCurrentQuestionIndex((index) => Math.min(questions.length - 1, index + 1));
  }

  function handleJump(index) {
    const firstUnansweredIndex = getFirstUnansweredIndex(answers);
    const maxReachableIndex = completion.isComplete ? questions.length - 1 : firstUnansweredIndex;
    const nextIndex = Math.min(Math.max(index, 0), maxReachableIndex);
    setMotionDirection(nextIndex >= currentQuestionIndex ? "forward" : "backward");
    setCurrentQuestionIndex(nextIndex);
    setView("assessment");
  }

  function handleResult() {
    if (!completion.isComplete) {
      setMotionDirection("jump");
      setCurrentQuestionIndex(getFirstUnansweredIndex(answers));
      return;
    }
    setView("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setAnswers({});
    setMotionDirection("jump");
    setCurrentQuestionIndex(0);
    setView("assessment");
    window.localStorage.removeItem(answerStorageKey);
    window.localStorage.removeItem(indexStorageKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="app-shell">
      <TopBar
        themeId={themeId}
        onThemeChange={handleThemeChange}
        completion={completion}
        reduceMotion={prefersReducedMotion}
      />

      {view === "result" ? (
        <ResultView
          answers={answers}
          scores={finalScores}
          summary={summary}
          onReset={handleReset}
          reduceMotion={prefersReducedMotion}
        />
      ) : (
        <div className="assessment-grid">
          <ProgressRail
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            onJump={handleJump}
            completion={completion}
            reduceMotion={prefersReducedMotion}
            onClear={handleReset}
          />
          <QuestionPanel
            currentQuestionIndex={currentQuestionIndex}
            motionDirection={motionDirection}
            answer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onResult={handleResult}
            canPrevious={currentQuestionIndex > 0}
            completion={completion}
          />
          <InsightPanel
            scores={previewScores}
            currentQuestionIndex={currentQuestionIndex}
            completion={completion}
            reduceMotion={prefersReducedMotion}
          />
        </div>
      )}
    </main>
  );
}
