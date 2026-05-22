import { questions } from "../data/assessment.js";

const validQuestionIds = new Set(questions.map((question) => question.id));
const defaultProfileName = "我的档案";

function createProfileId() {
  return `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeName(name) {
  const trimmed = String(name ?? "").trim();
  return trimmed || defaultProfileName;
}

function normalizeAnswers(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return {};

  return Object.fromEntries(
    Object.entries(answers).filter(([questionId, value]) => validQuestionIds.has(questionId) && value >= 1 && value <= 5),
  );
}

function normalizeQuestionIndex(index) {
  return Number.isInteger(index) && index >= 0 && index < questions.length ? index : 0;
}

export function createProfile({
  id = createProfileId(),
  name = defaultProfileName,
  answers = {},
  currentQuestionIndex = 0,
  hasSeenIntro = false,
} = {}) {
  return {
    id,
    name: normalizeName(name),
    answers: normalizeAnswers(answers),
    currentQuestionIndex: normalizeQuestionIndex(currentQuestionIndex),
    hasSeenIntro: Boolean(hasSeenIntro),
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

export function updateActiveProfile(state, patch) {
  return normalizeProfilesState({
    ...state,
    profiles: state.profiles.map((profile) => (profile.id === state.activeProfileId ? { ...profile, ...patch } : profile)),
  });
}

export function setActiveProfile(state, profileId) {
  return normalizeProfilesState({
    ...state,
    activeProfileId: profileId,
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
