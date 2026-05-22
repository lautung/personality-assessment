import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createProfile,
  createProfilesState,
  normalizeProfilesState,
  removeProfile,
  updateActiveProfile,
} from "../src/utils/profiles.js";

describe("profile storage helpers", () => {
  it("creates a default local profile state", () => {
    const state = createProfilesState();

    assert.equal(state.profiles.length, 1);
    assert.equal(state.activeProfileId, state.profiles[0].id);
    assert.equal(state.profiles[0].name, "我的档案");
    assert.deepEqual(state.profiles[0].answers, {});
  });

  it("normalizes persisted profiles and removes invalid answers", () => {
    const state = normalizeProfilesState({
      activeProfileId: "p2",
      profiles: [
        createProfile({ id: "p1", name: "A", answers: { q1: 5, q2: 9, nope: 3 }, currentQuestionIndex: 50 }),
        createProfile({ id: "p2", name: "B", answers: { q3: 2 }, currentQuestionIndex: 2, hasSeenIntro: true }),
      ],
    });

    assert.equal(state.activeProfileId, "p2");
    assert.deepEqual(state.profiles[0].answers, { q1: 5 });
    assert.equal(state.profiles[0].currentQuestionIndex, 0);
    assert.equal(state.profiles[1].hasSeenIntro, true);
  });

  it("updates only the active profile", () => {
    const state = normalizeProfilesState({
      activeProfileId: "p2",
      profiles: [
        createProfile({ id: "p1", name: "A" }),
        createProfile({ id: "p2", name: "B" }),
      ],
    });
    const updated = updateActiveProfile(state, { answers: { q1: 4 }, currentQuestionIndex: 1 });

    assert.deepEqual(updated.profiles[0].answers, {});
    assert.deepEqual(updated.profiles[1].answers, { q1: 4 });
    assert.equal(updated.profiles[1].currentQuestionIndex, 1);
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
