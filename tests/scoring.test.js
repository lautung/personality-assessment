import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { questions } from "../src/data/assessment.js";
import {
  calculateScores,
  getCompletion,
  getFirstUnansweredIndex,
  getScoreBand,
  getSummary,
  getTraitAdvice,
} from "../src/utils/scoring.js";

function answerAll(value) {
  return Object.fromEntries(questions.map((question) => [question.id, value]));
}

describe("scoring", () => {
  it("reports completion accurately", () => {
    assert.deepEqual(getCompletion({}), {
      answeredCount: 0,
      totalCount: 20,
      percent: 0,
      isComplete: false,
    });

    assert.equal(getCompletion(answerAll(3)).percent, 100);
    assert.equal(getCompletion(answerAll(3)).isComplete, true);
  });

  it("finds the first unanswered question", () => {
    assert.equal(getFirstUnansweredIndex({ q1: 3 }), 1);
    assert.equal(getFirstUnansweredIndex(answerAll(3)), 19);
  });

  it("keeps all-neutral answers in the balanced band", () => {
    const scores = calculateScores(answerAll(3));

    assert.equal(scores.length, 5);
    assert.ok(scores.every((score) => score.score === 50));
    assert.ok(scores.every((score) => score.band.id === "balanced"));
    assert.ok(scores.every((score) => score.confidence.id === "unclear"));
  });

  it("handles positive and reverse items for a high trait score", () => {
    const scores = calculateScores({ q1: 5, q2: 1, q3: 5, q4: 1 });
    const openness = scores.find((score) => score.key === "openness");

    assert.equal(openness.score, 100);
    assert.equal(openness.band.id, "very-high");
  });

  it("handles positive and reverse items for a low trait score", () => {
    const scores = calculateScores({ q1: 1, q2: 5, q3: 1, q4: 5 });
    const openness = scores.find((score) => score.key === "openness");

    assert.equal(openness.score, 0);
    assert.equal(openness.band.id, "very-low");
  });

  it("marks preview scores with insufficient samples", () => {
    const scores = calculateScores({ q1: 5 }, { preview: true });
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
    assert.match(getTraitAdvice(calculateScores(answerAll(3))[0]), /中段/);
  });

  it("adds a personalized summary for high openness and low discipline", () => {
    const scores = calculateScores({
      q1: 5,
      q2: 1,
      q3: 5,
      q4: 1,
      q5: 1,
      q6: 5,
      q7: 1,
      q8: 5,
    });
    const summary = getSummary(scores);

    assert.equal(summary.top.key, "openness");
    assert.equal(summary.low.key, "discipline");
    assert.match(summary.text, /探索落地|落地/);
    assert.match(summary.pattern, /探索/);
  });
});
