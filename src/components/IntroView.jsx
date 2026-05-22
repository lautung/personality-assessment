import { ArrowRight, Lock, Plus, UsersRound } from "lucide-react";
import { questions, traitOrder, traits } from "../data/assessment.js";

export default function IntroView({ profiles, activeProfileId, completion, onStart, onSwitchProfile, onAddProfile }) {
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0];
  const hasProgress = completion.answeredCount > 0;

  function handleAddProfile() {
    const name = window.prompt("输入本地用户名称", `用户 ${profiles.length + 1}`);
    if (name !== null) onAddProfile(name);
  }

  return (
    <section className="intro-view" aria-label="人格评估引导页">
      <div className="intro-copy reveal-item" style={{ "--reveal-index": 0 }}>
        <h1>五维人格探索，从一个本地档案开始</h1>
        <p>
          选择当前用户后开始答题。每个用户的答案、进度和结果只保存在这台设备的浏览器中，适合家庭、团队练习或同一设备多人轮流使用。
        </p>
        <div className="intro-actions">
          <button type="button" className="primary-button" onClick={onStart}>
            {hasProgress ? "继续测评" : "开始测评"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button type="button" className="secondary-button" onClick={handleAddProfile}>
            <Plus size={18} aria-hidden="true" />
            新建用户
          </button>
        </div>
        <div className="intro-privacy">
          <Lock size={17} aria-hidden="true" />
          <span>无登录、无上传、无数据库；清除浏览器数据会同时清除本地档案。</span>
        </div>
      </div>

      <div className="intro-panel panel reveal-item" style={{ "--reveal-index": 1 }}>
        <div className="intro-panel-header">
          <span>
            <UsersRound size={18} aria-hidden="true" />
            当前用户
          </span>
          <strong>{activeProfile.name}</strong>
        </div>

        <div className="intro-profile-list">
          {profiles.map((profile) => {
            const answeredCount = questions.filter((question) => profile.answers[question.id]).length;
            const active = profile.id === activeProfileId;
            return (
              <button
                key={profile.id}
                type="button"
                className={active ? "intro-profile active" : "intro-profile"}
                onClick={() => onSwitchProfile(profile.id)}
                aria-pressed={active}
              >
                <span>{profile.name}</span>
                <em>{answeredCount} / {questions.length} 题</em>
              </button>
            );
          })}
        </div>

        <div className="intro-traits" aria-label="五维概览">
          {traitOrder.map((traitKey) => (
            <span key={traitKey} style={{ "--trait-color": `var(${traits[traitKey].colorVar})` }}>
              {traits[traitKey].name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
