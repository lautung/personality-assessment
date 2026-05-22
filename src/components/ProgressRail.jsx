import { CheckCircle2, Circle, Compass, Heart, RotateCcw, ShieldCheck, Target, Users } from "lucide-react";
import { questions, traitOrder, traits } from "../data/assessment.js";
import AnimatedNumber from "./AnimatedNumber.jsx";

const traitIcons = {
  openness: Compass,
  discipline: Target,
  social: Users,
  empathy: Heart,
  resilience: ShieldCheck,
};

export default function ProgressRail({ answers, currentQuestionIndex, onJump, completion, reduceMotion, onClear }) {
  const firstUnansweredIndex = questions.findIndex((question) => !answers[question.id]);
  const maxReachableIndex = firstUnansweredIndex === -1 ? questions.length - 1 : firstUnansweredIndex;

  return (
    <aside className="progress-rail" aria-label="评估进度">
      <div className="rail-header">
        <span>评估进度</span>
        <strong>
          <AnimatedNumber value={completion.percent} suffix="%" disabled={reduceMotion} />
        </strong>
      </div>
      <div className="linear-progress" aria-label={`已完成 ${completion.answeredCount} / ${completion.totalCount} 题`}>
        <span style={{ width: `${completion.percent}%` }} />
      </div>
      <p>共 {completion.totalCount} 题，预计 5-8 分钟。所有答案仅保存在当前浏览器。</p>
      {completion.answeredCount > 0 ? (
        <button type="button" className="clear-progress-button" onClick={onClear}>
          <RotateCcw size={15} aria-hidden="true" />
          清除本次答案
        </button>
      ) : null}

      <div className="trait-steps">
        {traitOrder.map((traitKey, index) => {
          const trait = traits[traitKey];
          const Icon = traitIcons[traitKey];
          const traitQuestions = questions.filter((question) => question.trait === traitKey);
          const answeredCount = traitQuestions.filter((question) => answers[question.id]).length;
          const active = questions[currentQuestionIndex].trait === traitKey;
          const complete = answeredCount === traitQuestions.length;

          return (
            <button
              key={traitKey}
              type="button"
              className={["trait-step", active ? "active" : "", complete ? "complete" : ""].filter(Boolean).join(" ")}
              style={{ "--trait-color": `var(${trait.colorVar})` }}
              onClick={() => onJump(index * 4)}
              aria-current={active ? "step" : undefined}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>
                <strong>{trait.name}</strong>
                <em>{complete ? "已完成" : active ? "正在评估" : `${answeredCount}/4`}</em>
              </span>
            </button>
          );
        })}
      </div>

      <div className="question-dots" aria-label="题目导航">
        {questions.map((question, index) => {
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
              {answered ? <CheckCircle2 size={13} aria-hidden="true" /> : <Circle size={9} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
