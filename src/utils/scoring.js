const scoreBands = [
  {
    id: "very-low",
    min: 0,
    max: 34,
    label: "明显偏低",
    tone: "这一倾向目前不明显，通常会更依赖相反方向的行为策略。",
  },
  {
    id: "low",
    min: 35,
    max: 44,
    label: "略低",
    tone: "这一倾向相对保守，可能只在特定情境下出现。",
  },
  {
    id: "balanced",
    min: 45,
    max: 55,
    label: "平衡",
    tone: "这一维度暂时没有明显高低，更可能受场景、精力和任务类型影响。",
  },
  {
    id: "high",
    min: 56,
    max: 69,
    label: "略高",
    tone: "这一倾向已经比较稳定，通常会影响你的日常选择和协作方式。",
  },
  {
    id: "very-high",
    min: 70,
    max: 100,
    label: "明显偏高",
    tone: "这一倾向非常突出，是当前画像里更容易被他人观察到的部分。",
  },
];

function normalizeScore(average) {
  return Math.round(((average - 1) / 4) * 100);
}

function scoreAnswer(question, raw) {
  return question.reverse ? 6 - raw : raw;
}

export function getScoreBand(score) {
  if (typeof score !== "number") {
    return {
      id: "unknown",
      label: "待观察",
      tone: "该维度还没有足够回答，暂不生成明确倾向。",
    };
  }

  return scoreBands.find((band) => score >= band.min && score <= band.max) ?? scoreBands[2];
}

export function getConfidence(score, answeredCount, totalCount) {
  if (answeredCount < 2) {
    return {
      id: "insufficient",
      label: "样本不足",
      text: "该维度回答少于 2 题，暂不展示具体趋势。",
    };
  }

  if (answeredCount < totalCount) {
    return {
      id: "preview",
      label: "初步趋势",
      text: `该维度已回答 ${answeredCount}/${totalCount} 题，结果会继续变化。`,
    };
  }

  if (typeof score === "number" && Math.abs(score - 50) <= 8) {
    return {
      id: "unclear",
      label: "倾向不明显",
      text: "分数接近中段，说明这一维度更可能随情境变化。",
    };
  }

  return {
    id: "moderate",
    label: "可参考",
    text: "该维度已完成全部题目，可作为自我观察线索。",
  };
}

export function getTraitAdvice(score) {
  const band = getScoreBand(score.score);

  if (band.id === "balanced") {
    return `你的「${score.name}」处在中段，${band.tone}建议观察它在工作、关系和压力情境中的差异。`;
  }

  if (band.id === "very-high" || band.id === "high") {
    return `${band.tone}${score.high}`;
  }

  if (band.id === "very-low" || band.id === "low") {
    return `${band.tone}${score.low}`;
  }

  return band.tone;
}

export function getCompletion(assessment, answers) {
  const answeredCount = assessment.questions.filter((question) => answers[question.id]).length;
  return {
    answeredCount,
    totalCount: assessment.questions.length,
    percent: Math.round((answeredCount / assessment.questions.length) * 100),
    isComplete: answeredCount === assessment.questions.length,
  };
}

export function getFirstUnansweredIndex(assessment, answers) {
  const index = assessment.questions.findIndex((question) => !answers[question.id]);
  return index === -1 ? assessment.questions.length - 1 : index;
}

export function calculateScores(assessment, answers, { preview = false } = {}) {
  return assessment.traitOrder.map((traitKey) => {
    const traitQuestions = assessment.questions.filter((question) => question.trait === traitKey);
    const answeredQuestions = traitQuestions.filter((question) => answers[question.id]);
    const sourceQuestions = preview ? answeredQuestions : traitQuestions;
    const score =
      sourceQuestions.length === 0
        ? null
        : normalizeScore(
            sourceQuestions.reduce((sum, question) => sum + scoreAnswer(question, answers[question.id] ?? 3), 0) /
              sourceQuestions.length,
          );

    return {
      key: traitKey,
      assessmentId: assessment.id,
      ...assessment.traits[traitKey],
      score,
      answeredCount: answeredQuestions.length,
      totalCount: traitQuestions.length,
      band: getScoreBand(score),
      confidence: getConfidence(score, answeredQuestions.length, traitQuestions.length),
    };
  });
}

export function getSummary(assessment, scores) {
  const completedScores = scores.filter((score) => typeof score.score === "number");
  const sorted = [...completedScores].sort((a, b) => b.score - a.score);
  const top = sorted[0] ?? scores[0];
  const low = sorted[sorted.length - 1] ?? scores[scores.length - 1];
  const topBand = getScoreBand(top.score);
  const lowBand = getScoreBand(low.score);
  const pattern = assessment.summaryPatterns?.[`${top.key}:${low.key}`];

  return {
    top,
    low,
    text: assessment.buildSummaryText({ top, low, topBand, lowBand, pattern }),
    pattern: pattern?.title ?? assessment.neutralPatternTitle,
  };
}
