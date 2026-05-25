import {
  assessmentList,
  defaultAssessmentId,
  getAssessmentDefinition,
  getDefaultQuestionIds,
  getQuestionIdsForAssessment,
  normalizeQuestionIds,
} from "../data/assessment.js";

const validQuestionIdsByAssessment = Object.fromEntries(
  assessmentList.map((assessment) => [assessment.id, getQuestionIdsForAssessment(assessment.id)]),
);

export const defaultProfileName = "我的档案";

function createProfileId() {
  return `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeName(name) {
  const trimmed = String(name ?? "").trim();
  return trimmed || defaultProfileName;
}

function createEmptyAssessmentProgress(assessmentId) {
  const assessment = getAssessmentDefinition(assessmentId);
  return {
    answers: {},
    currentQuestionIndex: 0,
    hasSeenIntro: false,
    questionIds: getDefaultQuestionIds(assessmentId),
    totalQuestions: assessment.questions.length,
  };
}

function normalizeAnswers(assessmentId, answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return {};

  const validQuestionIds = validQuestionIdsByAssessment[assessmentId] ?? getQuestionIdsForAssessment(assessmentId);
  return Object.fromEntries(
    Object.entries(answers).filter(([questionId, value]) => validQuestionIds.has(questionId) && value >= 1 && value <= 5),
  );
}

function normalizeQuestionIndex(assessmentId, index) {
  const questionCount = getDefaultQuestionIds(assessmentId).length;
  return Number.isInteger(index) && index >= 0 && index < questionCount ? index : 0;
}

function normalizeAssessmentProgress(assessmentId, raw = {}) {
  const assessment = getAssessmentDefinition(assessmentId);
  const questionIds = normalizeQuestionIds(assessmentId, raw.questionIds);
  const questionCount = questionIds.length;
  const hasPersistedQuestionIds = Array.isArray(raw.questionIds);
  const keepsPersistedQuestionIds =
    hasPersistedQuestionIds &&
    raw.questionIds.length === questionIds.length &&
    raw.questionIds.every((questionId, index) => questionIds[index] === questionId);

  return {
    answers: normalizeAnswers(assessmentId, raw.answers),
    currentQuestionIndex:
      hasPersistedQuestionIds && !keepsPersistedQuestionIds
        ? 0
        : Number.isInteger(raw.currentQuestionIndex) && raw.currentQuestionIndex >= 0 && raw.currentQuestionIndex < questionCount
          ? raw.currentQuestionIndex
          : normalizeQuestionIndex(assessmentId, raw.currentQuestionIndex),
    hasSeenIntro: Boolean(raw.hasSeenIntro),
    questionIds,
    totalQuestions: assessment.questions.length,
  };
}

function normalizeAssessmentsMap(rawAssessments, legacyProfile = {}) {
  const source = rawAssessments && typeof rawAssessments === "object" ? rawAssessments : {};

  return Object.fromEntries(
    assessmentList.map((assessment) => {
      const legacySource =
        assessment.id === defaultAssessmentId
          ? {
              answers: legacyProfile.answers,
              currentQuestionIndex: legacyProfile.currentQuestionIndex,
              hasSeenIntro: legacyProfile.hasSeenIntro,
            }
          : undefined;

      return [assessment.id, normalizeAssessmentProgress(assessment.id, source[assessment.id] ?? legacySource)];
    }),
  );
}

export function createProfile({
  id = createProfileId(),
  name = defaultProfileName,
  activeAssessmentId = defaultAssessmentId,
  assessments,
  answers,
  currentQuestionIndex,
  hasSeenIntro,
} = {}) {
  const nextActiveAssessmentId = getAssessmentDefinition(activeAssessmentId).id;
  const normalizedAssessments = normalizeAssessmentsMap(assessments, { answers, currentQuestionIndex, hasSeenIntro });

  return {
    id,
    name: normalizeName(name),
    activeAssessmentId: nextActiveAssessmentId,
    assessments: normalizedAssessments,
  };
}

export function createProfilesState() {
  const profile = createProfile();
  return {
    activeProfileId: profile.id,
    profiles: [profile],
  };
}

export function normalizeProfilesState(raw) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.profiles)) {
    return createProfilesState();
  }

  const profiles = raw.profiles
    .filter((profile) => profile && typeof profile === "object")
    .map((profile, index) =>
      createProfile({
        id: profile.id || `profile-${index + 1}`,
        name: profile.name,
        activeAssessmentId: profile.activeAssessmentId,
        assessments: profile.assessments,
        answers: profile.answers,
        currentQuestionIndex: profile.currentQuestionIndex,
        hasSeenIntro: profile.hasSeenIntro,
      }),
    );

  if (profiles.length === 0) return createProfilesState();

  const activeProfileId = profiles.some((profile) => profile.id === raw.activeProfileId)
    ? raw.activeProfileId
    : profiles[0].id;

  return { activeProfileId, profiles };
}

export function getProfileAssessmentState(profile, assessmentId = profile?.activeAssessmentId ?? defaultAssessmentId) {
  if (!profile) return createEmptyAssessmentProgress(assessmentId);
  return profile.assessments?.[assessmentId] ?? createEmptyAssessmentProgress(assessmentId);
}

export function updateActiveProfile(state, patch) {
  return normalizeProfilesState({
    ...state,
    profiles: state.profiles.map((profile) => (profile.id === state.activeProfileId ? { ...profile, ...patch } : profile)),
  });
}

export function updateActiveProfileAssessment(state, assessmentId, patch) {
  return normalizeProfilesState({
    ...state,
    profiles: state.profiles.map((profile) =>
      profile.id === state.activeProfileId
        ? {
            ...profile,
            assessments: {
              ...profile.assessments,
              [assessmentId]: {
                ...getProfileAssessmentState(profile, assessmentId),
                ...patch,
              },
            },
          }
        : profile,
    ),
  });
}

export function setActiveProfile(state, profileId) {
  return normalizeProfilesState({
    ...state,
    activeProfileId: profileId,
  });
}

export function setActiveAssessment(state, assessmentId) {
  return normalizeProfilesState({
    ...state,
    profiles: state.profiles.map((profile) =>
      profile.id === state.activeProfileId ? { ...profile, activeAssessmentId: getAssessmentDefinition(assessmentId).id } : profile,
    ),
  });
}

export function addProfile(state, name) {
  const profile = createProfile({ name });
  return normalizeProfilesState({
    activeProfileId: profile.id,
    profiles: [...state.profiles, profile],
  });
}

export function removeProfile(state, profileId) {
  const remainingProfiles = state.profiles.filter((profile) => profile.id !== profileId);

  if (remainingProfiles.length === 0) return createProfilesState();

  return normalizeProfilesState({
    activeProfileId: state.activeProfileId === profileId ? remainingProfiles[0].id : state.activeProfileId,
    profiles: remainingProfiles,
  });
}
