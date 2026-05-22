import { useEffect, useMemo, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import ProgressRail from "./components/ProgressRail.jsx";
import QuestionPanel from "./components/QuestionPanel.jsx";
import InsightPanel from "./components/InsightPanel.jsx";
import ResultView from "./components/ResultView.jsx";
import IntroView from "./components/IntroView.jsx";
import { defaultThemeId, isValidTheme } from "./data/themes.js";
import { questions } from "./data/assessment.js";
import { calculateScores, getCompletion, getFirstUnansweredIndex, getSummary } from "./utils/scoring.js";
import {
  addProfile,
  createProfilesState,
  normalizeProfilesState,
  removeProfile,
  setActiveProfile,
  updateActiveProfile,
} from "./utils/profiles.js";
import usePrefersReducedMotion from "./hooks/usePrefersReducedMotion.js";

const storageKey = "personality-assessment-theme";
const profileStorageKey = "personality-assessment-profiles-v1";
const legacyAnswerStorageKey = "personality-assessment-answers";
const legacyIndexStorageKey = "personality-assessment-current-index";

function getInitialTheme() {
  const stored = window.localStorage.getItem(storageKey);
  return isValidTheme(stored) ? stored : defaultThemeId;
}

function getLegacyAnswers() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(legacyAnswerStorageKey) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getLegacyQuestionIndex() {
  const stored = Number(window.localStorage.getItem(legacyIndexStorageKey));
  return Number.isInteger(stored) && stored >= 0 && stored < questions.length ? stored : 0;
}

function getInitialProfilesState() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(profileStorageKey) ?? "null");
    if (parsed) return normalizeProfilesState(parsed);
  } catch {
    return createProfilesState();
  }

  const legacyAnswers = getLegacyAnswers();
  const state = createProfilesState();
  if (Object.keys(legacyAnswers).length === 0) return state;

  return updateActiveProfile(state, {
    answers: legacyAnswers,
    currentQuestionIndex: getLegacyQuestionIndex(),
    hasSeenIntro: true,
  });
}

export default function App() {
  const [profilesState, setProfilesState] = useState(getInitialProfilesState);
  const [themeId, setThemeId] = useState(getInitialTheme);
  const [view, setView] = useState(() => {
    const initialState = getInitialProfilesState();
    const profile = initialState.profiles.find((item) => item.id === initialState.activeProfileId) ?? initialState.profiles[0];
    return profile.hasSeenIntro ? "assessment" : "intro";
  });
  const [motionDirection, setMotionDirection] = useState("forward");
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeProfile =
    profilesState.profiles.find((profile) => profile.id === profilesState.activeProfileId) ?? profilesState.profiles[0];
  const answers = activeProfile.answers;
  const currentQuestionIndex = activeProfile.currentQuestionIndex;

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
    window.localStorage.setItem(profileStorageKey, JSON.stringify(profilesState));
  }, [profilesState]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (view !== "assessment") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const value = Number(event.key);
      if (value >= 1 && value <= 5) {
        setProfilesState((current) =>
          updateActiveProfile(current, {
            answers: { ...activeProfile.answers, [currentQuestion.id]: value },
          }),
        );
      }
      if (event.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setMotionDirection("backward");
        setProfilesState((current) =>
          updateActiveProfile(current, { currentQuestionIndex: Math.max(0, currentQuestionIndex - 1) }),
        );
      }
      if (event.key === "ArrowRight" && answers[currentQuestion.id] && currentQuestionIndex < questions.length - 1) {
        setMotionDirection("forward");
        setProfilesState((current) =>
          updateActiveProfile(current, {
            currentQuestionIndex: Math.min(questions.length - 1, currentQuestionIndex + 1),
          }),
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeProfile.answers, answers, currentQuestion, currentQuestionIndex, view]);

  function handleThemeChange(nextThemeId) {
    setThemeId(nextThemeId);
  }

  function handleAnswer(questionId, value) {
    setProfilesState((current) =>
      updateActiveProfile(current, {
        answers: { ...activeProfile.answers, [questionId]: value },
      }),
    );
  }

  function handlePrevious() {
    setMotionDirection("backward");
    setProfilesState((current) =>
      updateActiveProfile(current, { currentQuestionIndex: Math.max(0, currentQuestionIndex - 1) }),
    );
  }

  function handleNext() {
    if (!answers[currentQuestion.id]) return;
    setMotionDirection("forward");
    setProfilesState((current) =>
      updateActiveProfile(current, { currentQuestionIndex: Math.min(questions.length - 1, currentQuestionIndex + 1) }),
    );
  }

  function handleJump(index) {
    const firstUnansweredIndex = getFirstUnansweredIndex(answers);
    const maxReachableIndex = completion.isComplete ? questions.length - 1 : firstUnansweredIndex;
    const nextIndex = Math.min(Math.max(index, 0), maxReachableIndex);
    setMotionDirection(nextIndex >= currentQuestionIndex ? "forward" : "backward");
    setProfilesState((current) => updateActiveProfile(current, { currentQuestionIndex: nextIndex, hasSeenIntro: true }));
    setView("assessment");
  }

  function handleResult() {
    if (!completion.isComplete) {
      setMotionDirection("jump");
      setProfilesState((current) =>
        updateActiveProfile(current, { currentQuestionIndex: getFirstUnansweredIndex(answers), hasSeenIntro: true }),
      );
      return;
    }
    setProfilesState((current) => updateActiveProfile(current, { hasSeenIntro: true }));
    setView("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setMotionDirection("jump");
    setProfilesState((current) => updateActiveProfile(current, { answers: {}, currentQuestionIndex: 0, hasSeenIntro: true }));
    setView("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStart() {
    setProfilesState((current) => updateActiveProfile(current, { hasSeenIntro: true }));
    setView("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSwitchProfile(profileId) {
    const nextState = setActiveProfile(profilesState, profileId);
    const nextProfile = nextState.profiles.find((profile) => profile.id === nextState.activeProfileId) ?? nextState.profiles[0];
    setProfilesState(nextState);
    setMotionDirection("jump");
    setView(nextProfile.hasSeenIntro ? "assessment" : "intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAddProfile(name) {
    const nextState = addProfile(profilesState, name);
    setProfilesState(nextState);
    setMotionDirection("jump");
    setView("intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRemoveProfile(profileId) {
    const nextState = removeProfile(profilesState, profileId);
    const nextProfile = nextState.profiles.find((profile) => profile.id === nextState.activeProfileId) ?? nextState.profiles[0];
    setProfilesState(nextState);
    setMotionDirection("jump");
    setView(nextProfile.hasSeenIntro ? "assessment" : "intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="app-shell">
      <TopBar
        themeId={themeId}
        onThemeChange={handleThemeChange}
        completion={completion}
        reduceMotion={prefersReducedMotion}
        profiles={profilesState.profiles}
        activeProfileId={profilesState.activeProfileId}
        onSwitchProfile={handleSwitchProfile}
        onAddProfile={handleAddProfile}
        onRemoveProfile={handleRemoveProfile}
      />

      {view === "intro" ? (
        <IntroView
          profiles={profilesState.profiles}
          activeProfileId={profilesState.activeProfileId}
          completion={completion}
          onStart={handleStart}
          onSwitchProfile={handleSwitchProfile}
          onAddProfile={handleAddProfile}
        />
      ) : view === "result" ? (
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
