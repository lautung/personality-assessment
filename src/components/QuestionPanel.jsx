import { useRef } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Lock } from "lucide-react";
import { answerOptions, questions, traits } from "../data/assessment.js";

export default function QuestionPanel({
  currentQuestionIndex,
  motionDirection,
  answer,
  onAnswer,
  onPrevious,
  onNext,
  onResult,
  canPrevious,
  completion,
}) {
  const question = questions[currentQuestionIndex];
  const trait = traits[question.trait];
  const selected = Boolean(answer);
  const isLast = currentQuestionIndex === questions.length - 1;
  const stageClass = `question-stage question-stage-${motionDirection}`;
  const optionRefs = useRef([]);

  function handleOptionKeyDown(event, index) {
    const keyOffsets = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    const selectedIndex = answerOptions.findIndex((option) => option.value === answer);
    const currentIndex = selectedIndex === -1 ? index : selectedIndex;
    let nextIndex = null;

    if (event.key in keyOffsets) {
      nextIndex = (currentIndex + keyOffsets[event.key] + answerOptions.length) % answerOptions.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = answerOptions.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextOption = answerOptions[nextIndex];
    onAnswer(question.id, nextOption.value);
    window.requestAnimationFrame(() => optionRefs.current[nextIndex]?.focus());
  }

  return (
    <section className="question-panel" aria-label="人格评估题目">
      <div className={stageClass} key={question.id}>
        <div className="question-meta">
          <div>
            <span>{trait.name}</span>
            <strong>
              第 {currentQuestionIndex + 1} 题 / 共 {questions.length} 题
            </strong>
          </div>
          <div className="mini-progress">
            <div
              role="progressbar"
              aria-label={`已完成 ${completion.answeredCount} / ${completion.totalCount} 题`}
              aria-valuemin={0}
              aria-valuemax={completion.totalCount}
              aria-valuenow={completion.answeredCount}
            >
              <span style={{ width: `${completion.percent}%` }} />
            </div>
          </div>
        </div>

        <div className="question-content">
          <h1>{question.text}</h1>
          <p>
            <Lock size={16} aria-hidden="true" />
            请选择最符合你最近状态的选项，答案只用于生成本次个人画像。
          </p>
        </div>

        <div className="likert-group" role="radiogroup" aria-label={question.text}>
          {answerOptions.map((option, index) => {
            const isSelected = answer === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                className={isSelected ? "likert-option selected" : "likert-option"}
                aria-checked={isSelected}
                tabIndex={isSelected || (!answer && index === 0) ? 0 : -1}
                style={{ "--option-index": index }}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                onClick={() => onAnswer(question.id, option.value)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
              >
                <span>{option.value}</span>
                <strong>{option.label}</strong>
              </button>
            );
          })}
        </div>

        <div className="trait-insight-card" style={{ "--trait-color": `var(${trait.colorVar})` }}>
          <span className="trait-insight-icon">
            <Bookmark size={20} aria-hidden="true" />
          </span>
          <div>
            <strong>这一题属于「{trait.name}」</strong>
            <p>{trait.insight}</p>
          </div>
        </div>
      </div>

      <div className="flow-actions">
        <button type="button" className="secondary-button" onClick={onPrevious} disabled={!canPrevious}>
          <ArrowLeft size={18} aria-hidden="true" />
          上一题
        </button>

        <span className="keyboard-hint">选中后可修改，按 1 到 5 快速选择，方向键切换选项</span>

        {isLast ? (
          <button type="button" className="primary-button" onClick={onResult} disabled={!completion.isComplete}>
            查看结果
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={onNext} disabled={!selected}>
            下一题
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
