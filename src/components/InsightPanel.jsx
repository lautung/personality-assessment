import { Activity, BarChart3 } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber.jsx";
import RadarChart from "./RadarChart.jsx";

export default function InsightPanel({ assessment, scores, currentQuestionIndex, completion, reduceMotion }) {
  const currentQuestion = assessment.questions[currentQuestionIndex];
  const currentTrait = assessment.traits[currentQuestion.trait];
  const radarReady = scores.every((score) => score.answeredCount >= 2);

  return (
    <aside className="insight-panel" aria-label="实时洞察">
      <div className="insight-header">
        <div>
          <span>实时洞察</span>
          <strong>
            基于已回答的 <AnimatedNumber value={completion.answeredCount} disabled={reduceMotion} /> 题
          </strong>
        </div>
        <Activity size={20} aria-hidden="true" />
      </div>

      <div className="radar-wrap">
        {radarReady ? (
          <RadarChart scores={scores} compact ariaLabel={assessment.radarLabel} />
        ) : (
          <div className="radar-empty-state" role="status">
            <BarChart3 size={26} aria-hidden="true" />
            <strong>雷达图待生成</strong>
            <span>每个维度至少完成 2 题后展示真实形状</span>
          </div>
        )}
      </div>

      <div className="score-preview-list">
        {scores.map((score, index) => (
          <div
            className="score-preview"
            key={score.key}
            style={{ "--trait-color": `var(${score.colorVar})`, "--reveal-index": index }}
          >
            <span>{score.name}</span>
            <div className="preview-bar">
              <span style={{ width: `${score.answeredCount < 2 ? 8 : score.score}%` }} />
            </div>
            <strong>
              {score.answeredCount < 2 ? (
                score.answeredCount === 0 ? (
                  "待观察"
                ) : (
                  "样本不足"
                )
              ) : (
                <AnimatedNumber value={score.score} disabled={reduceMotion} />
              )}
            </strong>
          </div>
        ))}
      </div>

      <div className="micro-insight" key={currentQuestion.trait} style={{ "--trait-color": `var(${currentTrait.colorVar})` }}>
        <BarChart3 size={20} aria-hidden="true" />
        <div>
          <strong>{currentTrait.name}</strong>
          <p>{currentTrait.description}</p>
        </div>
      </div>

      <p className="insight-note">提示：实时洞察会随选择即时更新，最终结果以完成全部题目后的计算为准。</p>
    </aside>
  );
}
