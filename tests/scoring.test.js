import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAssessmentDefinition } from "../src/data/assessment.js";
import {
  calculateScores,
  getCompletion,
  getFirstUnansweredIndex,
  getScoreBand,
  getSummary,
  getTraitAdvice,
} from "../src/utils/scoring.js";

const fiveDim = getAssessmentDefinition("five-dim");
const disc = getAssessmentDefinition("disc");

function answerAll(assessment, value) {
  return Object.fromEntries(assessment.questions.map((question) => [question.id, value]));
}

describe("scoring", () => {
  it("reports completion accurately for five-dim", () => {
    assert.deepEqual(getCompletion(fiveDim, {}), {
      answeredCount: 0,
      totalCount: 20,
      percent: 0,
      isComplete: false,
    });

    assert.equal(getCompletion(fiveDim, answerAll(fiveDim, 3)).percent, 100);
    assert.equal(getCompletion(fiveDim, answerAll(fiveDim, 3)).isComplete, true);
  });

  it("finds the first unanswered question", () => {
    assert.equal(getFirstUnansweredIndex(fiveDim, { q1: 3 }), 1);
    assert.equal(getFirstUnansweredIndex(fiveDim, answerAll(fiveDim, 3)), 19);
  });

  it("keeps all-neutral five-dim answers in the balanced band", () => {
    const scores = calculateScores(fiveDim, answerAll(fiveDim, 3));

    assert.equal(scores.length, 5);
    assert.ok(scores.every((score) => score.score === 50));
    assert.ok(scores.every((score) => score.band.id === "balanced"));
    assert.ok(scores.every((score) => score.confidence.id === "unclear"));
  });

  it("handles positive and reverse items for a high trait score", () => {
    const scores = calculateScores(fiveDim, { q1: 5, q2: 1, q3: 5, q4: 1 });
    const openness = scores.find((score) => score.key === "openness");

    assert.equal(openness.score, 100);
    assert.equal(openness.band.id, "very-high");
  });

  it("handles positive and reverse items for a low trait score", () => {
    const scores = calculateScores(fiveDim, { q1: 1, q2: 5, q3: 1, q4: 5 });
    const openness = scores.find((score) => score.key === "openness");

    assert.equal(openness.score, 0);
    assert.equal(openness.band.id, "very-low");
  });

  it("marks preview scores with insufficient samples", () => {
    const scores = calculateScores(fiveDim, { q1: 5 }, { preview: true });
    const openness = scores.find((score) => score.key === "openness");
    const discipline = scores.find((score) => score.key === "discipline");

    assert.equal(openness.score, 100);
    assert.equal(openness.confidence.id, "insufficient");
    assert.equal(discipline.score, null);
    assert.equal(discipline.band.id, "unknown");
  });

  it("returns tier metadata and balanced advice", () => {
    assert.equal(getScoreBand(39).id, "low");
    assert.equal(getScoreBand(50).id, "balanced");
    assert.match(getTraitAdvice(calculateScores(fiveDim, answerAll(fiveDim, 3))[0]), /中段/);
  });

  it("adds a personalized summary for high openness and low discipline", () => {
    const scores = calculateScores(fiveDim, {
      q1: 5,
      q2: 1,
      q3: 5,
      q4: 1,
      q5: 1,
      q6: 5,
      q7: 1,
      q8: 5,
    });
    const summary = getSummary(fiveDim, scores);

    assert.equal(summary.top.key, "openness");
    assert.equal(summary.low.key, "discipline");
    assert.match(summary.text, /探索落地|落地/);
    assert.match(summary.pattern, /探索/);
  });

  it("supports DISC completion and balanced scores", () => {
    assert.deepEqual(getCompletion(disc, {}), {
      answeredCount: 0,
      totalCount: 16,
      percent: 0,
      isComplete: false,
    });

    const scores = calculateScores(disc, answerAll(disc, 3));
    assert.equal(scores.length, 4);
    assert.ok(scores.every((score) => score.score === 50));
  });

  it("supports DISC reverse scoring and summary selection", () => {
    const answers = {
      "disc-q1": 5,
      "disc-q2": 1,
      "disc-q3": 5,
      "disc-q4": 1,
      "disc-q9": 1,
      "disc-q10": 5,
      "disc-q11": 1,
      "disc-q12": 5,
    };
    const scores = calculateScores(disc, answers);
    const dominance = scores.find((score) => score.key === "dominance");
    const steadiness = scores.find((score) => score.key === "steadiness");
    const summary = getSummary(disc, scores);

    assert.equal(dominance.score, 100);
    assert.equal(steadiness.score, 0);
    assert.equal(summary.top.key, "dominance");
    assert.equal(summary.low.key, "steadiness");
    assert.match(summary.text, /默认工作方式|主导|推进/);
  });

  it("supports DISC preview scoring with partial answers", () => {
    const scores = calculateScores(disc, { "disc-q1": 5 }, { preview: true });
    const dominance = scores.find((score) => score.key === "dominance");
    const influence = scores.find((score) => score.key === "influence");

    assert.equal(dominance.score, 100);
    assert.equal(dominance.confidence.id, "insufficient");
    assert.equal(influence.score, null);
  });
});
