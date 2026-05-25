import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAssessmentSession,
  createQuestionSetIds,
  getAssessmentDefinition,
  getDefaultQuestionIds,
} from "../src/data/assessment.js";

function createDeterministicRandom(values) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

describe("assessment question selection", () => {
  it("builds a balanced random five-dim question set", () => {
    const questionIds = createQuestionSetIds("five-dim", createDeterministicRandom([0.05, 0.85, 0.25, 0.65, 0.45]));
    const assessment = buildAssessmentSession("five-dim", questionIds);

    assert.equal(questionIds.length, 20);
    assert.equal(new Set(questionIds).size, 20);

    for (const traitKey of assessment.traitOrder) {
      const traitQuestions = assessment.questions.filter((question) => question.trait === traitKey);
      assert.equal(traitQuestions.length, 4);
      assert.equal(traitQuestions.filter((question) => question.reverse).length, 2);
    }
  });

  it("builds a balanced random DISC question set", () => {
    const questionIds = createQuestionSetIds("disc", createDeterministicRandom([0.15, 0.35, 0.55, 0.75, 0.95]));
    const assessment = buildAssessmentSession("disc", questionIds);

    assert.equal(questionIds.length, 16);
    assert.equal(new Set(questionIds).size, 16);

    for (const traitKey of assessment.traitOrder) {
      const traitQuestions = assessment.questions.filter((question) => question.trait === traitKey);
      assert.equal(traitQuestions.length, 4);
      assert.equal(traitQuestions.filter((question) => question.reverse).length, 2);
    }
  });

  it("falls back to the default question set when session ids are incomplete", () => {
    const questionIds = buildAssessmentSession("disc", ["disc-q1", "disc-q2"]).questionIds;

    assert.deepEqual(questionIds, getDefaultQuestionIds("disc"));
  });

  it("keeps the original fixed question order on base assessment definitions", () => {
    const assessment = getAssessmentDefinition("five-dim");

    assert.deepEqual(
      assessment.questions.map((question) => question.id),
      getDefaultQuestionIds("five-dim"),
    );
  });
});
