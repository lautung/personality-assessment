import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { answerOptions, getAssessmentDefinition } from "../src/data/assessment.js";
import { calculateScores, getSummary } from "../src/utils/scoring.js";
import { buildTextReport, copyTextReport, getAnswerReviewRows } from "../src/utils/report.js";

const fiveDim = getAssessmentDefinition("five-dim");
const disc = getAssessmentDefinition("disc");

function answerAll(assessment, value) {
  return Object.fromEntries(assessment.questions.map((question) => [question.id, value]));
}

describe("report helpers", () => {
  it("creates answer review rows with trait and reverse metadata", () => {
    const rows = getAnswerReviewRows(fiveDim, { q1: 5, q2: 1 });

    assert.equal(rows.length, 2);
    assert.equal(rows[0].questionText, fiveDim.questions[0].text);
    assert.equal(rows[0].traitName, fiveDim.traits.openness.name);
    assert.equal(rows[0].answerLabel, answerOptions[4].label);
    assert.equal(rows[0].reverse, false);
    assert.equal(rows[1].reverse, true);
    assert.equal(rows[1].scoredValue, 5);
  });

  it("builds a text report with method metadata and answers", () => {
    const answers = answerAll(fiveDim, 3);
    const scores = calculateScores(fiveDim, answers);
    const summary = getSummary(fiveDim, scores);
    const report = buildTextReport({ assessment: fiveDim, answers, scores, summary });

    assert.match(report, /人格评估报告/);
    assert.match(report, /测评方法/);
    assert.match(report, /五维结果/);
    assert.match(report, /答案回看/);
    assert.match(report, /非正式心理测量量表/);
    assert.match(report, new RegExp(fiveDim.questions[0].text));
  });

  it("builds a DISC report with DISC-specific section titles", () => {
    const answers = answerAll(disc, 3);
    const scores = calculateScores(disc, answers);
    const summary = getSummary(disc, scores);
    const report = buildTextReport({ assessment: disc, answers, scores, summary });

    assert.match(report, /DISC 行为风格报告/);
    assert.match(report, /DISC 四维结果/);
    assert.match(report, new RegExp(disc.questions[0].text));
  });

  it("returns a clear status when clipboard is unavailable", async () => {
    const result = await copyTextReport("report", null);

    assert.equal(result.ok, false);
    assert.match(result.message, /导出文本报告/);
  });

  it("handles clipboard permission rejection without throwing", async () => {
    const result = await copyTextReport("report", {
      writeText: async () => {
        throw new Error("denied");
      },
    });

    assert.equal(result.ok, false);
    assert.match(result.message, /复制权限/);
  });
});
