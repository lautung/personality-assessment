import {
  assessmentList,
  defaultAssessmentId,
  getAssessmentDefinition,
  getDefaultQuestionIds,
  getQuestionIdsForAssessment,
  normalizeQuestionIds,
} from "../data/assessment.ts";

const validQuestionIdsByAssessment = Object.fromEntries(
  assessmentList.map((assessment) => [assessment.id, getQuestionIdsForAssessment(assessment.id)]),
);

type AssessmentProgressPatch = {
  answers?: Record<string, number>;
  currentQuestionIndex?: number;
  hasSeenIntro?: boolean;
  questionIds?: string[];
};

type AssessmentProgress = {
  answers: Record<string, number>;
  currentQuestionIndex: number;
  hasSeenIntro: boolean;
  questionIds: string[];
  totalQuestions: number;
};

type ProfileInput = {
  id?: string;
  name?: string;
  activeAssessmentId?: string;
  assessments?: Record<string, AssessmentProgressPatch>;
  answers?: Record<string, number>;
  currentQuestionIndex?: number;
  hasSeenIntro?: boolean;
};

type Profile = {
  id: string;
  name: string;
  activeAssessmentId: string;
  assessments: Record<string, AssessmentProgress>;
};

type ProfilesState = {
  activeProfileId: string;
  profiles: Profile[];
};

export const defaultProfileName = "我的档案";

function createProfileId() {
  return `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeName(name: unknown) {
  const trimmed = String(name ?? "").trim();
  return trimmed || defaultProfileName;
}

function createEmptyAssessmentProgress(assessmentId: string): AssessmentProgress {
  const assessment = getAssessmentDefinition(assessmentId);
  return {
    answers: {},
    currentQuestionIndex: 0,
    hasSeenIntro: false,
    questionIds: getDefaultQuestionIds(assessmentId),
    totalQuestions: assessment.questions.length,
  };
}

function normalizeAnswers(assessmentId: string, answers: unknown) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return {};

  const validQuestionIds = validQuestionIdsByAssessment[assessmentId] ?? getQuestionIdsForAssessment(assessmentId);
  return Object.fromEntries(
    Object.entries(answers).filter(
      ([questionId, value]) => validQuestionIds.has(questionId) && typeof value === "number" && value >= 1 && value <= 5,
    ),
  );
}

function normalizeQuestionIndex(assessmentId: string, index: unknown) {
  const questionCount = getDefaultQuestionIds(assessmentId).length;
  return typeof index === "number" && Number.isInteger(index) && index >= 0 && index < questionCount ? index : 0;
}

function normalizeAssessmentProgress(assessmentId: string, raw: AssessmentProgressPatch = {}): AssessmentProgress {
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

function normalizeAssessmentsMap(rawAssessments: unknown, legacyProfile: AssessmentProgressPatch = {}) {
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

      return [
        assessment.id,
        normalizeAssessmentProgress(assessment.id, (source as Record<string, AssessmentProgressPatch>)[assessment.id] ?? legacySource),
      ];
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
}: ProfileInput = {}): Profile {
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

export function normalizeProfilesState(raw: any): ProfilesState {
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

export function getProfileAssessmentState(profile?: Profile, assessmentId = profile?.activeAssessmentId ?? defaultAssessmentId) {
  if (!profile) return createEmptyAssessmentProgress(assessmentId);
  return profile.assessments?.[assessmentId] ?? createEmptyAssessmentProgress(assessmentId);
}

export function updateActiveProfile(state: ProfilesState, patch: Partial<Profile>) {
  return normalizeProfilesState({
    ...state,
    profiles: state.profiles.map((profile) => (profile.id === state.activeProfileId ? { ...profile, ...patch } : profile)),
  });
}

export function updateActiveProfileAssessment(state: ProfilesState, assessmentId: string, patch: AssessmentProgressPatch) {
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

export function setActiveProfile(state: ProfilesState, profileId: string) {
  return normalizeProfilesState({
    ...state,
    activeProfileId: profileId,
  });
}

export function setActiveAssessment(state: ProfilesState, assessmentId: string) {
  return normalizeProfilesState({
    ...state,
    profiles: state.profiles.map((profile) =>
      profile.id === state.activeProfileId ? { ...profile, activeAssessmentId: getAssessmentDefinition(assessmentId).id } : profile,
    ),
  });
}

export function addProfile(state: ProfilesState, name?: string) {
  const profile = createProfile({ name });
  return normalizeProfilesState({
    activeProfileId: profile.id,
    profiles: [...state.profiles, profile],
  });
}

export function removeProfile(state: ProfilesState, profileId: string) {
  const remainingProfiles = state.profiles.filter((profile) => profile.id !== profileId);

  if (remainingProfiles.length === 0) return createProfilesState();

  return normalizeProfilesState({
    activeProfileId: state.activeProfileId === profileId ? remainingProfiles[0].id : state.activeProfileId,
    profiles: remainingProfiles,
  });
}
