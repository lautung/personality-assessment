import { answerOptions } from "../data/assessment.ts";
import { getTraitAdvice } from "./scoring.ts";

function getAnswerLabel(value) {
  return answerOptions.find((option) => option.value === value)?.label ?? "未作答";
}

function getScoredValue(question, value) {
  if (!value) return null;
  return question.reverse ? 6 - value : value;
}

export function getAnswerReviewRows(assessment, answers) {
  return assessment.questions
    .filter((question) => answers[question.id])
    .map((question, index) => {
      const answerValue = answers[question.id];
      return {
        number: index + 1,
        id: question.id,
        questionText: question.text,
        traitKey: question.trait,
        traitName: assessment.traits[question.trait].name,
        answerValue,
        answerLabel: getAnswerLabel(answerValue),
        reverse: question.reverse,
        scoredValue: getScoredValue(question, answerValue),
      };
    });
}

export function buildTextReport({ assessment, answers, scores, summary }) {
  const scoreLines = scores
    .map(
      (score) =>
        `- ${score.name}: ${score.score} 分（${score.band.label}，${score.confidence.label}）\n  ${getTraitAdvice(score)}`,
    )
    .join("\n");
  const answerLines = getAnswerReviewRows(assessment, answers)
    .map(
      (row) =>
        `${row.number}. [${row.traitName}] ${row.questionText}\n   回答：${row.answerValue} ${row.answerLabel}${
          row.reverse ? `；反向题，计分值 ${row.scoredValue}` : ""
        }`,
    )
    .join("\n");

  return [
    assessment.reportTitle,
    "",
    "测评方法",
    assessment.name,
    "",
    "总体摘要",
    summary.text,
    "",
    assessment.reportScoresTitle,
    scoreLines,
    "",
    assessment.answerReviewTitle,
    answerLines || "暂无答案。",
    "",
    "边界说明",
    "本报告仅用于自我探索，是非正式心理测量量表，没有常模、信效度验证或临床解释能力，不应用于诊断、招聘、筛选或高风险决策。",
  ].join("\n");
}

export async function copyTextReport(reportText, clipboard: Pick<Clipboard, "writeText"> | null | undefined = navigator.clipboard) {
  if (!clipboard?.writeText) {
    return {
      ok: false,
      message: "当前浏览器不支持直接复制，可使用导出文本报告。",
    };
  }

  try {
    await clipboard.writeText(reportText);
    return {
      ok: true,
      message: "报告已复制到剪贴板。",
    };
  } catch {
    return {
      ok: false,
      message: "复制权限被浏览器拒绝，可使用导出文本报告。",
    };
  }
}

export function downloadTextReport(reportText, filename = "personality-assessment-report.txt") {
  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
