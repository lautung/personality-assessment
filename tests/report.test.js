import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { answerOptions, questions, traits } from "../src/data/assessment.js";
import { calculateScores, getSummary } from "../src/utils/scoring.js";
import { buildTextReport, copyTextReport, getAnswerReviewRows } from "../src/utils/report.js";

function answerAll(value) {
  return Object.fromEntries(questions.map((question) => [question.id, value]));
}

describe("report helpers", () => {
  it("creates answer review rows with trait and reverse metadata", () => {
    const rows = getAnswerReviewRows({ q1: 5, q2: 1 });

    assert.equal(rows.length, 2);
    assert.equal(rows[0].questionText, questions[0].text);
    assert.equal(rows[0].traitName, traits.openness.name);
    assert.equal(rows[0].answerLabel, answerOptions[4].label);
    assert.equal(rows[0].reverse, false);
    assert.equal(rows[1].reverse, true);
    assert.equal(rows[1].scoredValue, 5);
  });

  it("builds a text report with scores, boundary, and answers", () => {
    const answers = answerAll(3);
    const scores = calculateScores(answers);
    const summary = getSummary(scores);
    const report = buildTextReport({ answers, scores, summary });

    assert.match(report, /人格评估报告/);
    assert.match(report, /五维结果/);
    assert.match(report, /答案回看/);
    assert.match(report, /非正式心理测量量表/);
    assert.match(report, new RegExp(questions[0].text));
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
