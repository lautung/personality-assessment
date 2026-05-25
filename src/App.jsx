import { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import ProgressRail from "./components/ProgressRail.jsx";
import QuestionPanel from "./components/QuestionPanel.jsx";
import InsightPanel from "./components/InsightPanel.jsx";
import ResultView from "./components/ResultView.jsx";
import IntroView from "./components/IntroView.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import {
  assessmentList,
  buildAssessmentSession,
  createQuestionSetIds,
  defaultAssessmentId,
  getAssessmentDefinition,
} from "./data/assessment.js";
import { defaultThemeId, isValidTheme } from "./data/themes.js";
import { calculateScores, getCompletion, getFirstUnansweredIndex, getSummary } from "./utils/scoring.js";
import {
  addProfile,
  createProfilesState,
  getProfileAssessmentState,
  normalizeProfilesState,
  removeProfile,
  setActiveAssessment,
  setActiveProfile,
  updateActiveProfile,
  updateActiveProfileAssessment,
} from "./utils/profiles.js";
import usePrefersReducedMotion from "./hooks/usePrefersReducedMotion.js";

const storageKey = "personality-assessment-theme";
const profileStorageKey = "personality-assessment-profiles-v1";
const legacyAnswerStorageKey = "personality-assessment-answers";
const legacyIndexStorageKey = "personality-assessment-current-index";
const autoAdvanceDelay = 650;

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
  const defaultAssessment = getAssessmentDefinition(defaultAssessmentId);
  return Number.isInteger(stored) && stored >= 0 && stored < defaultAssessment.questions.length ? stored : 0;
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

  return updateActiveProfileAssessment(state, defaultAssessmentId, {
    answers: legacyAnswers,
    currentQuestionIndex: getLegacyQuestionIndex(),
    hasSeenIntro: true,
  });
}

function getInitialAppState() {
  return {
    profilesState: getInitialProfilesState(),
    view: "intro",
  };
}

export default function App() {
  const [initialAppState] = useState(getInitialAppState);
  const [profilesState, setProfilesState] = useState(initialAppState.profilesState);
  const [themeId, setThemeId] = useState(getInitialTheme);
  const [view, setView] = useState(initialAppState.view);
  const [motionDirection, setMotionDirection] = useState("forward");
  const autoAdvanceTimerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const profilesStateRef = useRef(profilesState);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const prefersReducedMotion = usePrefersReducedMotion();
  profilesStateRef.current = profilesState;
  const activeProfile =
    profilesState.profiles.find((profile) => profile.id === profilesState.activeProfileId) ?? profilesState.profiles[0];
  const activeAssessmentId = activeProfile.activeAssessmentId ?? defaultAssessmentId;
  const assessmentState = getProfileAssessmentState(activeProfile, activeAssessmentId);
  const assessment = useMemo(
    () => buildAssessmentSession(activeAssessmentId, assessmentState.questionIds),
    [activeAssessmentId, assessmentState.questionIds],
  );
  const answers = assessmentState.answers;
  const currentQuestionIndex = assessmentState.currentQuestionIndex;

  const completion = useMemo(() => getCompletion(assessment, answers), [assessment, answers]);
  const previewScores = useMemo(() => calculateScores(assessment, answers, { preview: true }), [assessment, answers]);
  const finalScores = useMemo(() => calculateScores(assessment, answers), [assessment, answers]);
  const summary = useMemo(() => getSummary(assessment, finalScores), [assessment, finalScores]);
  const currentQuestion = assessment.questions[currentQuestionIndex];

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    window.localStorage.setItem(storageKey, themeId);
  }, [themeId]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      window.localStorage.setItem(profileStorageKey, JSON.stringify(profilesState));
    }, 400);
    return () => clearTimeout(saveTimerRef.current);
  }, [profilesState]);

  useEffect(() => {
    function handleUnload() {
      window.localStorage.setItem(profileStorageKey, JSON.stringify(profilesStateRef.current));
    }
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    return () => clearAutoAdvanceTimer();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (view !== "assessment" || !currentQuestion) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (
        event.target instanceof Element &&
        (event.target.closest(".likert-group") || event.target.closest(".profile-switcher") || event.target.tagName === "SELECT") &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)
      ) {
        return;
      }
      const value = Number(event.key);
      if (value >= 1 && value <= 5) {
        handleAnswer(currentQuestion.id, value);
      }
      if (event.key === "ArrowLeft" && currentQuestionIndex > 0) {
        handlePrevious();
      }
      if (event.key === "ArrowRight" && answers[currentQuestion.id] && currentQuestionIndex < assessment.questions.length - 1) {
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answers, assessment, currentQuestion, currentQuestionIndex, view]);

  function clearAutoAdvanceTimer() {
    if (!autoAdvanceTimerRef.current) return;
    window.clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = null;
  }

  function scheduleAutoAdvance(questionId, questionIndex) {
    clearAutoAdvanceTimer();
    if (view !== "assessment") return;
    if (questionIndex >= assessment.questions.length - 1) return;
    if (assessment.questions[questionIndex]?.id !== questionId) return;

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      setMotionDirection("forward");
      setProfilesState((current) => {
        const currentProfile =
          current.profiles.find((profile) => profile.id === current.activeProfileId) ?? current.profiles[0];
        const currentAssessmentId = currentProfile.activeAssessmentId ?? defaultAssessmentId;
        if (currentAssessmentId !== assessment.id) return current;

        const currentProgress = getProfileAssessmentState(currentProfile, currentAssessmentId);
        const currentAssessment = buildAssessmentSession(currentAssessmentId, currentProgress.questionIds);
        const stillOnSameQuestion = currentProgress.currentQuestionIndex === questionIndex;
        const currentQuestionId = currentAssessment.questions[currentProgress.currentQuestionIndex]?.id;
        const hasCurrentAnswer = Boolean(currentProgress.answers[questionId]);

        if (!stillOnSameQuestion || currentQuestionId !== questionId || !hasCurrentAnswer) return current;

        return updateActiveProfileAssessment(current, currentAssessmentId, {
          currentQuestionIndex: Math.min(currentAssessment.questions.length - 1, questionIndex + 1),
        });
      });
    }, autoAdvanceDelay);
  }

  function handleThemeChange(nextThemeId) {
    setThemeId(nextThemeId);
  }

  function handleAnswer(questionId, value) {
    const questionIndex = currentQuestionIndex;
    setProfilesState((current) => {
      const currentProfile = current.profiles.find((profile) => profile.id === current.activeProfileId) ?? current.profiles[0];
      const currentAssessmentId = currentProfile.activeAssessmentId ?? defaultAssessmentId;
      const currentProgress = getProfileAssessmentState(currentProfile, currentAssessmentId);

      return updateActiveProfileAssessment(current, currentAssessmentId, {
        answers: {
          ...currentProgress.answers,
          [questionId]: value,
        },
      });
    });
    scheduleAutoAdvance(questionId, questionIndex);
  }

  function handlePrevious() {
    clearAutoAdvanceTimer();
    setMotionDirection("backward");
    setProfilesState((current) =>
      updateActiveProfileAssessment(current, activeAssessmentId, {
        currentQuestionIndex: Math.max(0, currentQuestionIndex - 1),
      }),
    );
  }

  function handleNext() {
    clearAutoAdvanceTimer();
    if (!currentQuestion || !answers[currentQuestion.id]) return;
    setMotionDirection("forward");
    setProfilesState((current) =>
      updateActiveProfileAssessment(current, activeAssessmentId, {
        currentQuestionIndex: Math.min(assessment.questions.length - 1, currentQuestionIndex + 1),
      }),
    );
  }

  function handleJump(index) {
    clearAutoAdvanceTimer();
    const firstUnansweredIndex = getFirstUnansweredIndex(assessment, answers);
    const maxReachableIndex = completion.isComplete ? assessment.questions.length - 1 : firstUnansweredIndex;
    const nextIndex = Math.min(Math.max(index, 0), maxReachableIndex);
    setMotionDirection(nextIndex >= currentQuestionIndex ? "forward" : "backward");
    setProfilesState((current) =>
      updateActiveProfileAssessment(current, activeAssessmentId, {
        currentQuestionIndex: nextIndex,
        hasSeenIntro: true,
      }),
    );
    setView("assessment");
  }

  function handleResult() {
    clearAutoAdvanceTimer();
    if (!completion.isComplete) {
      setMotionDirection("jump");
      setProfilesState((current) =>
        updateActiveProfileAssessment(current, activeAssessmentId, {
          currentQuestionIndex: getFirstUnansweredIndex(assessment, answers),
          hasSeenIntro: true,
        }),
      );
      return;
    }
    setProfilesState((current) => updateActiveProfileAssessment(current, activeAssessmentId, { hasSeenIntro: true }));
    setView("result");
    window.scrollTo({ top: 0, behavior: scrollToTop });
  }

  function handleReset() {
    clearAutoAdvanceTimer();
    setMotionDirection("jump");
    setProfilesState((current) =>
      updateActiveProfileAssessment(current, activeAssessmentId, {
        answers: {},
        currentQuestionIndex: 0,
        hasSeenIntro: true,
        questionIds: createQuestionSetIds(activeAssessmentId),
      }),
    );
    setView("assessment");
    window.scrollTo({ top: 0, behavior: scrollToTop });
  }

  function handleStart(profileName) {
    clearAutoAdvanceTimer();
    setProfilesState((current) => {
      const renamedState = updateActiveProfile(current, { name: profileName });
      const currentProfile =
        renamedState.profiles.find((profile) => profile.id === renamedState.activeProfileId) ?? renamedState.profiles[0];
      const currentAssessmentId = currentProfile.activeAssessmentId ?? defaultAssessmentId;
      const currentProgress = getProfileAssessmentState(currentProfile, currentAssessmentId);
      const hasAnswers = Object.keys(currentProgress.answers).length > 0;

      return updateActiveProfileAssessment(renamedState, currentAssessmentId, {
        hasSeenIntro: true,
        currentQuestionIndex: hasAnswers ? currentProgress.currentQuestionIndex : 0,
        questionIds: hasAnswers ? currentProgress.questionIds : createQuestionSetIds(currentAssessmentId),
      });
    });
    setView("assessment");
    window.scrollTo({ top: 0, behavior: scrollToTop });
  }

  function handleSwitchProfile(profileId) {
    clearAutoAdvanceTimer();
    setProfilesState(setActiveProfile(profilesState, profileId));
    setMotionDirection("jump");
    setView("intro");
    window.scrollTo({ top: 0, behavior: scrollToTop });
  }

  function handleSwitchAssessment(assessmentId) {
    clearAutoAdvanceTimer();
    setProfilesState(setActiveAssessment(profilesState, assessmentId));
    setMotionDirection("jump");
    setView("intro");
    window.scrollTo({ top: 0, behavior: scrollToTop });
  }

  function handleAddProfile(name) {
    clearAutoAdvanceTimer();
    setProfilesState(addProfile(profilesState, name));
    setMotionDirection("jump");
    setView("intro");
    window.scrollTo({ top: 0, behavior: scrollToTop });
  }

  function handleRemoveProfile(profileId) {
    clearAutoAdvanceTimer();
    setProfilesState(removeProfile(profilesState, profileId));
    setMotionDirection("jump");
    setView("intro");
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "instant" : "smooth" });
  }

  function handleBackToIntro() {
    clearAutoAdvanceTimer();
    setMotionDirection("jump");
    setView("intro");
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "instant" : "smooth" });
  }

  function showConfirm({ title, message, confirmLabel, onConfirm }) {
    setConfirmDialog({ open: true, title, message, confirmLabel, onConfirm });
  }

  const scrollToTop = prefersReducedMotion ? "instant" : "smooth";

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
        onRemoveProfile={(profileId) =>
          showConfirm({
            title: "删除用户档案",
            message: "确定要删除此用户的所有数据吗？包括答案和评估结果，此操作不可撤销。",
            confirmLabel: "删除",
            onConfirm: () => handleRemoveProfile(profileId),
          })
        }
        onBackToIntro={view === "assessment" ? handleBackToIntro : undefined}
        assessment={assessment}
      />

      {view === "intro" ? (
        <IntroView
          profiles={profilesState.profiles}
          activeProfileId={profilesState.activeProfileId}
          completion={completion}
          assessment={assessment}
          assessments={assessmentList}
          onStart={handleStart}
          onSwitchProfile={handleSwitchProfile}
          onAddProfile={handleAddProfile}
          onSwitchAssessment={handleSwitchAssessment}
        />
      ) : view === "result" ? (
        <ResultView
          assessment={assessment}
          answers={answers}
          scores={finalScores}
          summary={summary}
          onReset={() =>
            showConfirm({
              title: "重新测试",
              message: "确定要重新开始测试吗？当前结果将被清除。",
              confirmLabel: "重新测试",
              onConfirm: () => handleReset(),
            })
          }
          reduceMotion={prefersReducedMotion}
        />
      ) : (
        <div className="assessment-grid">
          <ProgressRail
            assessment={assessment}
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            onJump={handleJump}
            completion={completion}
            reduceMotion={prefersReducedMotion}
            onClear={() =>
              showConfirm({
                title: "清除本次答案",
                message: "确定要清除当前用户的所有答案吗？此操作不可撤销。",
                confirmLabel: "清除",
                onConfirm: () => handleReset(),
              })
            }
          />
          <QuestionPanel
            assessment={assessment}
            currentQuestionIndex={currentQuestionIndex}
            motionDirection={motionDirection}
            answer={answers[currentQuestion?.id]}
            onAnswer={handleAnswer}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onResult={handleResult}
            canPrevious={currentQuestionIndex > 0}
            completion={completion}
          />
          <InsightPanel
            assessment={assessment}
            scores={previewScores}
            currentQuestionIndex={currentQuestionIndex}
            completion={completion}
            reduceMotion={prefersReducedMotion}
          />
        </div>
      )}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog({ open: false });
        }}
        onCancel={() => setConfirmDialog({ open: false })}
      />
    </main>
  );
}
