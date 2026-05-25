import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Circle,
  Compass,
  Heart,
  Megaphone,
  RotateCcw,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { getQuestionCountByTrait } from "../data/assessment.js";
import AnimatedNumber from "./AnimatedNumber.jsx";

const traitIcons = {
  openness: Compass,
  discipline: Target,
  social: Users,
  empathy: Heart,
  resilience: ShieldCheck,
  dominance: Target,
  influence: Megaphone,
  steadiness: Heart,
  conscientiousness: BriefcaseBusiness,
};

export default function ProgressRail({ assessment, answers, currentQuestionIndex, onJump, completion, reduceMotion, onClear }) {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const firstUnansweredIndex = assessment.questions.findIndex((question) => !answers[question.id]);
  const maxReachableIndex = firstUnansweredIndex === -1 ? assessment.questions.length - 1 : firstUnansweredIndex;
  const questionCountByTrait = getQuestionCountByTrait(assessment);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 860px)");
    const handleChange = () => setDetailsOpen(!query.matches);

    handleChange();
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <aside className="progress-rail" aria-label="评估进度">
      <div className="rail-header">
        <span>评估进度</span>
        <strong>
          <AnimatedNumber value={completion.percent} suffix="%" disabled={reduceMotion} />
        </strong>
      </div>
      <div
        className="linear-progress"
        role="progressbar"
        aria-label={`已完成 ${completion.answeredCount} / ${completion.totalCount} 题`}
        aria-valuemin={0}
        aria-valuemax={completion.totalCount}
        aria-valuenow={completion.answeredCount}
      >
        <span style={{ width: `${completion.percent}%` }} />
      </div>
      <p>
        共 {completion.totalCount} 题，{assessment.estimatedTime}。{assessment.progressSummary}
      </p>
      {completion.answeredCount > 0 ? (
        <button type="button" className="clear-progress-button" onClick={onClear}>
          <RotateCcw size={15} aria-hidden="true" />
          清除本次答案
        </button>
      ) : null}

      <div className={detailsOpen ? "progress-details open" : "progress-details"}>
        <button
          type="button"
          className="progress-details-toggle"
          aria-expanded={detailsOpen}
          onClick={() => setDetailsOpen((open) => !open)}
        >
          进度详情
          <ChevronDown size={16} aria-hidden="true" />
        </button>

        <div className="progress-detail-content" hidden={!detailsOpen}>
          <div className="trait-steps">
            {assessment.traitOrder.map((traitKey, index) => {
              const trait = assessment.traits[traitKey];
              const Icon = traitIcons[traitKey] ?? Circle;
              const traitQuestions = assessment.questions.filter((question) => question.trait === traitKey);
              const answeredCount = traitQuestions.filter((question) => answers[question.id]).length;
              const active = assessment.questions[currentQuestionIndex]?.trait === traitKey;
              const complete = answeredCount === traitQuestions.length;
              const firstIndex = assessment.questions.findIndex((question) => question.trait === traitKey);

              return (
                <button
                  key={traitKey}
                  type="button"
                  className={["trait-step", active ? "active" : "", complete ? "complete" : ""].filter(Boolean).join(" ")}
                  style={{ "--trait-color": `var(${trait.colorVar})` }}
                  onClick={() => onJump(firstIndex)}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="step-number">{index + 1}</span>
                  <span className="step-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{trait.name}</strong>
                    <em>{complete ? "已完成" : active ? "正在评估" : `${answeredCount}/${questionCountByTrait[traitKey]}`}</em>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="question-dots" aria-label="题目导航">
            {assessment.questions.map((question, index) => {
              const answered = Boolean(answers[question.id]);
              const current = index === currentQuestionIndex;
              const disabled = index > maxReachableIndex && !answered;
              return (
                <button
                  key={question.id}
                  type="button"
                  className={["question-dot", current ? "current" : "", answered ? "answered" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={disabled}
                  aria-label={`第 ${index + 1} 题${answered ? "，已作答" : ""}`}
                  onClick={() => onJump(index)}
                >
                  {answered ? <CheckCircle2 size={14} aria-hidden="true" /> : <Circle size={10} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
