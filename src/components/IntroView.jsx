import { useEffect, useState } from "react";
import { ArrowRight, Lock, Plus, UserRound, UsersRound } from "lucide-react";
import { getCompletion } from "../utils/scoring.js";
import { defaultProfileName, getProfileAssessmentState } from "../utils/profiles.js";

export default function IntroView({
  profiles,
  activeProfileId,
  completion,
  assessment,
  assessments,
  onStart,
  onSwitchProfile,
  onAddProfile,
  onSwitchAssessment,
}) {
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0];
  const hasProgress = completion.answeredCount > 0;
  const [profileName, setProfileName] = useState(activeProfile.name === defaultProfileName ? "" : activeProfile.name);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    setProfileName(activeProfile.name === defaultProfileName ? "" : activeProfile.name);
    setNameError("");
  }, [activeProfile.id, activeProfile.name, assessment.id]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = profileName.trim();
    if (!trimmedName) {
      setNameError("请先填写你的名字。");
      return;
    }
    onStart(trimmedName);
  }

  function handleAddProfile() {
    onAddProfile(defaultProfileName);
  }

  return (
    <section className="intro-view" aria-label="人格评估引导页">
      <div className="intro-copy reveal-item" style={{ "--reveal-index": 0 }}>
        <h1>{assessment.introTitle}</h1>
        <p>{assessment.introDescription}</p>

        <div className="method-selector" aria-label="评估方法选择">
          {assessments.map((item) => {
            const selected = item.id === assessment.id;
            const methodProgress = getCompletion(item, getProfileAssessmentState(activeProfile, item.id).answers);

            return (
              <button
                key={item.id}
                type="button"
                className={selected ? "method-card selected" : "method-card"}
                onClick={() => onSwitchAssessment(item.id)}
                aria-pressed={selected}
              >
                <span>{item.name}</span>
                <strong>{methodProgress.answeredCount} / {item.questions.length} 题</strong>
              </button>
            );
          })}
        </div>

        <form className="intro-start-form" onSubmit={handleSubmit}>
          <label htmlFor="profile-name">
            <span>
              <UserRound size={17} aria-hidden="true" />
              你的名字
            </span>
            <input
              id="profile-name"
              value={profileName}
              onChange={(event) => {
                setProfileName(event.target.value);
                setNameError("");
              }}
              placeholder="例如：林一"
              autoComplete="given-name"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "profile-name-error" : undefined}
            />
          </label>
          {nameError ? (
            <p className="form-error" id="profile-name-error" role="alert">
              {nameError}
            </p>
          ) : null}
          <div className="intro-actions">
            <button type="submit" className="primary-button">
              {hasProgress ? "继续该测评" : "开始测评"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="secondary-button" onClick={handleAddProfile}>
              <Plus size={18} aria-hidden="true" />
              新建用户
            </button>
          </div>
        </form>
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
            const active = profile.id === activeProfileId;
            const methodProgress = getCompletion(assessment, getProfileAssessmentState(profile, assessment.id).answers);
            return (
              <button
                key={profile.id}
                type="button"
                className={active ? "intro-profile active" : "intro-profile"}
                onClick={() => onSwitchProfile(profile.id)}
                aria-pressed={active}
              >
                <span>{profile.name}</span>
                <em>{methodProgress.answeredCount} / {assessment.questions.length} 题</em>
              </button>
            );
          })}
        </div>

        <div className="intro-traits" aria-label={assessment.introOverviewLabel}>
          {assessment.traitOrder.map((traitKey) => (
            <span key={traitKey} style={{ "--trait-color": `var(${assessment.traits[traitKey].colorVar})` }}>
              {assessment.traits[traitKey].name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
