import { questions, traitOrder, traits } from "../data/assessment.js";

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

const summaryPatterns = {
  "openness:discipline": {
    title: "探索落地型",
    text: "你很容易被新想法和未知领域激发，但稳定执行相对保守。适合把探索拆成更短的验证周期，用小实验把灵感落地。",
  },
  "empathy:resilience": {
    title: "共情边界型",
    text: "你对他人处境和合作氛围很敏感，但压力恢复需要更多空间。适合在照顾关系的同时提前设定边界和恢复机制。",
  },
  "discipline:openness": {
    title: "秩序拓展型",
    text: "你擅长持续推进和维持秩序，但面对新方向时可能更谨慎。适合在稳定计划中保留少量探索预算。",
  },
  "social:resilience": {
    title: "表达恢复型",
    text: "你能从交流中获得能量，但压力恢复可能需要额外照顾。适合把密集社交和安静恢复安排成清晰节奏。",
  },
  "resilience:empathy": {
    title: "稳态直行型",
    text: "你在压力中相对稳定，但协作同理维度较保守。适合在推进目标时主动确认他人的关切，减少沟通摩擦。",
  },
};

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

export function getCompletion(answers) {
  const answeredCount = questions.filter((question) => answers[question.id]).length;
  return {
    answeredCount,
    totalCount: questions.length,
    percent: Math.round((answeredCount / questions.length) * 100),
    isComplete: answeredCount === questions.length,
  };
}

export function getFirstUnansweredIndex(answers) {
  const index = questions.findIndex((question) => !answers[question.id]);
  return index === -1 ? questions.length - 1 : index;
}

export function calculateScores(answers, { preview = false } = {}) {
  return traitOrder.map((traitKey) => {
    const traitQuestions = questions.filter((question) => question.trait === traitKey);
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
      ...traits[traitKey],
      score,
      answeredCount: answeredQuestions.length,
      totalCount: traitQuestions.length,
      band: getScoreBand(score),
      confidence: getConfidence(score, answeredQuestions.length, traitQuestions.length),
    };
  });
}

export function getSummary(scores) {
  const completedScores = scores.filter((score) => typeof score.score === "number");
  const sorted = [...completedScores].sort((a, b) => b.score - a.score);
  const top = sorted[0] ?? scores[0];
  const low = sorted[sorted.length - 1] ?? scores[scores.length - 1];
  const topBand = getScoreBand(top.score);
  const lowBand = getScoreBand(low.score);
  const pattern = summaryPatterns[`${top.key}:${low.key}`];
  const text =
    pattern
      ? `${pattern.text}你的最高维度是“${top.name}”，最低维度是“${low.name}”，这个组合更适合作为行动线索，而不是固定标签。`
      : topBand.id === "balanced" && lowBand.id === "balanced"
      ? "你的五维结果整体集中在中段，说明当前画像更像情境型：不同任务、关系和压力状态下可能呈现不同侧面。"
      : `你的当前画像以“${top.name}”最突出，属于“${topBand.label}”；“${low.name}”相对保守，属于“${lowBand.label}”。这些结果更适合作为自我观察线索，而不是固定标签。`;

  return {
    top,
    low,
    text,
    pattern: pattern?.title ?? "五维观察型",
  };
}
