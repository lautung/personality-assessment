import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDefaultQuestionIds } from "../src/data/assessment.js";
import {
  addProfile,
  createProfile,
  createProfilesState,
  getProfileAssessmentState,
  normalizeProfilesState,
  removeProfile,
  setActiveAssessment,
  updateActiveProfile,
  updateActiveProfileAssessment,
} from "../src/utils/profiles.js";

describe("profile storage helpers", () => {
  it("creates a default local profile state", () => {
    const state = createProfilesState();

    assert.equal(state.profiles.length, 1);
    assert.equal(state.activeProfileId, state.profiles[0].id);
    assert.equal(state.profiles[0].name, "我的档案");
    assert.equal(state.profiles[0].activeAssessmentId, "five-dim");
    assert.deepEqual(getProfileAssessmentState(state.profiles[0], "five-dim").answers, {});
    assert.deepEqual(getProfileAssessmentState(state.profiles[0], "disc").answers, {});
    assert.deepEqual(getProfileAssessmentState(state.profiles[0], "five-dim").questionIds, getDefaultQuestionIds("five-dim"));
  });

  it("normalizes legacy persisted profiles and removes invalid answers", () => {
    const state = normalizeProfilesState({
      activeProfileId: "p2",
      profiles: [
        createProfile({ id: "p1", name: "A", answers: { q1: 5, q2: 9, nope: 3 }, currentQuestionIndex: 50 }),
        createProfile({
          id: "p2",
          name: "B",
          activeAssessmentId: "disc",
          assessments: {
            disc: { answers: { "disc-q1": 2, bad: 6 }, currentQuestionIndex: 99, hasSeenIntro: true },
          },
        }),
      ],
    });

    assert.equal(state.activeProfileId, "p2");
    assert.deepEqual(getProfileAssessmentState(state.profiles[0], "five-dim").answers, { q1: 5 });
    assert.equal(getProfileAssessmentState(state.profiles[0], "five-dim").currentQuestionIndex, 0);
    assert.equal(state.profiles[1].activeAssessmentId, "disc");
    assert.deepEqual(getProfileAssessmentState(state.profiles[1], "disc").answers, { "disc-q1": 2 });
    assert.equal(getProfileAssessmentState(state.profiles[1], "disc").currentQuestionIndex, 0);
    assert.equal(getProfileAssessmentState(state.profiles[1], "disc").hasSeenIntro, true);
    assert.deepEqual(getProfileAssessmentState(state.profiles[0], "five-dim").questionIds, getDefaultQuestionIds("five-dim"));
  });

  it("updates only the active profile assessment bucket", () => {
    const state = normalizeProfilesState({
      activeProfileId: "p2",
      profiles: [
        createProfile({ id: "p1", name: "A" }),
        createProfile({ id: "p2", name: "B", activeAssessmentId: "disc" }),
      ],
    });
    const updated = updateActiveProfileAssessment(state, "disc", {
      answers: { "disc-q1": 4 },
      currentQuestionIndex: 1,
    });

    assert.deepEqual(getProfileAssessmentState(updated.profiles[0], "disc").answers, {});
    assert.deepEqual(getProfileAssessmentState(updated.profiles[1], "disc").answers, { "disc-q1": 4 });
    assert.equal(getProfileAssessmentState(updated.profiles[1], "disc").currentQuestionIndex, 1);
    assert.deepEqual(getProfileAssessmentState(updated.profiles[1], "five-dim").answers, {});
  });

  it("falls back to the default question set when persisted question ids are invalid", () => {
    const state = normalizeProfilesState({
      activeProfileId: "p1",
      profiles: [
        createProfile({
          id: "p1",
          assessments: {
            disc: {
              answers: { "disc-q1": 5 },
              currentQuestionIndex: 12,
              hasSeenIntro: true,
              questionIds: ["disc-q1", "disc-q2", "bad-id"],
            },
          },
        }),
      ],
    });

    assert.deepEqual(getProfileAssessmentState(state.profiles[0], "disc").questionIds, getDefaultQuestionIds("disc"));
    assert.equal(getProfileAssessmentState(state.profiles[0], "disc").currentQuestionIndex, 0);
  });

  it("trims profile names when updating the active profile", () => {
    const state = normalizeProfilesState({
      activeProfileId: "p1",
      profiles: [createProfile({ id: "p1", name: "A" })],
    });
    const updated = updateActiveProfile(state, { name: "  林一  " });

    assert.equal(updated.profiles[0].name, "林一");
  });

  it("keeps each assessment progress when switching methods", () => {
    const state = normalizeProfilesState({
      activeProfileId: "p1",
      profiles: [
        createProfile({
          id: "p1",
          activeAssessmentId: "five-dim",
          assessments: {
            "five-dim": { answers: { q1: 5 }, currentQuestionIndex: 1, hasSeenIntro: true },
            disc: { answers: { "disc-q1": 4 }, currentQuestionIndex: 1, hasSeenIntro: true },
          },
        }),
      ],
    });

    const switched = setActiveAssessment(state, "disc");

    assert.equal(switched.profiles[0].activeAssessmentId, "disc");
    assert.deepEqual(getProfileAssessmentState(switched.profiles[0], "five-dim").answers, { q1: 5 });
    assert.deepEqual(getProfileAssessmentState(switched.profiles[0], "disc").answers, { "disc-q1": 4 });
  });

  it("adds unnamed profiles as guided draft profiles", () => {
    const state = createProfilesState();
    const updated = addProfile(state);

    assert.equal(updated.profiles.length, 2);
    assert.equal(updated.profiles[1].name, "我的档案");
    assert.equal(getProfileAssessmentState(updated.profiles[1], "five-dim").hasSeenIntro, false);
    assert.equal(updated.activeProfileId, updated.profiles[1].id);
  });

  it("keeps one profile when removing the active profile", () => {
    const state = normalizeProfilesState({
      activeProfileId: "p1",
      profiles: [createProfile({ id: "p1", name: "A" })],
    });
    const updated = removeProfile(state, "p1");

    assert.equal(updated.profiles.length, 1);
    assert.equal(updated.activeProfileId, updated.profiles[0].id);
  });
});
