import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCopy, Download, RotateCcw } from "lucide-react";
import { buildTextReport, copyTextReport, downloadTextReport, getAnswerReviewRows } from "../utils/report.js";
import { getTraitAdvice } from "../utils/scoring.js";
import AnimatedNumber from "./AnimatedNumber.jsx";
import RadarChart from "./RadarChart.jsx";

export default function ResultView({ assessment, answers, scores, summary, onReset, reduceMotion }) {
  const [copyStatus, setCopyStatus] = useState("");
  const reportText = useMemo(() => buildTextReport({ assessment, answers, scores, summary }), [assessment, answers, scores, summary]);
  const answerRows = useMemo(() => getAnswerReviewRows(assessment, answers), [assessment, answers]);

  function handleDownload() {
    downloadTextReport(reportText, `${assessment.id}-report.txt`);
  }

  async function handleCopy() {
    const result = await copyTextReport(reportText);
    setCopyStatus(result.message);
    window.setTimeout(() => setCopyStatus(""), result.ok ? 1800 : 2800);
  }

  return (
    <section className="result-view" aria-label="人格评估结果">
      <div className="result-hero reveal-item" style={{ "--reveal-index": 0 }}>
        <div>
          <span className="section-kicker">评估结果</span>
          <h1>{assessment.resultTitle}</h1>
          <p>{summary.text}</p>
          <p className="result-context">{assessment.resultContext}</p>
        </div>
        <CheckCircle2 size={42} aria-hidden="true" />
      </div>

      <div className="result-grid">
        <div className="result-radar panel reveal-item" style={{ "--reveal-index": 1 }}>
          <RadarChart scores={scores} ariaLabel={assessment.radarLabel} />
        </div>

        <div className="summary-cards">
          <article className="panel summary-card reveal-item" style={{ "--reveal-index": 2 }}>
            <span>{assessment.topLabel}</span>
            <strong>{summary.top.name}</strong>
            <em>{summary.top.band.label}</em>
            <p>{getTraitAdvice(summary.top)}</p>
          </article>
          <article className="panel summary-card reveal-item" style={{ "--reveal-index": 3 }}>
            <span>{assessment.lowLabel}</span>
            <strong>{summary.low.name}</strong>
            <em>{summary.low.band.label}</em>
            <p>{getTraitAdvice(summary.low)}</p>
          </article>
        </div>
      </div>

      <section className="report-tools panel reveal-item" style={{ "--reveal-index": 4 }} aria-label="报告工具">
        <div>
          <span className="section-kicker">本地报告</span>
          <h2>导出结果与回看答案</h2>
          <p>报告只在当前浏览器生成，不会上传答案。可保存为文本，或在下方展开逐题复盘。</p>
          <p className="copy-status" role="status" aria-live="polite">
            {copyStatus}
          </p>
        </div>
        <div className="report-actions">
          <button type="button" className="primary-button" onClick={handleDownload}>
            <Download size={18} aria-hidden="true" />
            导出文本报告
          </button>
          <button type="button" className="secondary-button" onClick={handleCopy}>
            <ClipboardCopy size={18} aria-hidden="true" />
            复制报告
          </button>
        </div>
      </section>

      <div className="dimension-results">
        {scores.map((score, index) => (
          <article
            className="dimension-row panel reveal-item"
            key={score.key}
            style={{ "--trait-color": `var(${score.colorVar})`, "--reveal-index": index + 5 }}
          >
            <div>
              <span>{score.name}</span>
              <p>{score.description}</p>
            </div>
            <div className="dimension-meter">
              <strong>
                <AnimatedNumber value={score.score} disabled={reduceMotion} />
              </strong>
              <em>{score.band.label}</em>
              <div className="preview-bar">
                <span style={{ width: `${score.score}%` }} />
              </div>
            </div>
            <div className="dimension-copy">
              <p className="confidence-note">
                <strong>{score.confidence.label}</strong>
                {score.confidence.text}
              </p>
              <p className="dimension-advice">{getTraitAdvice(score)}</p>
            </div>
          </article>
        ))}
      </div>

      <details className="answer-review panel reveal-item" style={{ "--reveal-index": 10 }}>
        <summary>
          <span>{assessment.answerReviewTitle}</span>
          <em>{answerRows.length} 道题已记录</em>
        </summary>
        <div className="answer-review-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">题号</th>
                <th scope="col">题目</th>
                <th scope="col">维度</th>
                <th scope="col">回答</th>
                <th scope="col">计分处理</th>
              </tr>
            </thead>
            <tbody>
              {answerRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.number}</td>
                  <td>{row.questionText}</td>
                  <td>{row.traitName}</td>
                  <td>
                    {row.answerValue} · {row.answerLabel}
                  </td>
                  <td>
                    {row.reverse ? <span className="reverse-badge">反向题</span> : null}
                    <span>计分 {row.scoredValue}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="result-footer reveal-item" style={{ "--reveal-index": 11 }}>
        <div className="disclaimer panel">
          <strong>免责声明</strong>
          <p>
            本结果仅用于自我探索和日常反思，不构成医学、心理诊断、招聘筛选、职业决策或任何专业建议。本测评没有常模，不应替代正式心理测量工具。
          </p>
        </div>
        <button type="button" className="secondary-button reset-action" onClick={onReset}>
          <RotateCcw size={18} aria-hidden="true" />
          重新测试
        </button>
      </div>
    </section>
  );
}
