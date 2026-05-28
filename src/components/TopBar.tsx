import { useEffect, useState } from "react";
import { House, Menu, ShieldCheck, Sparkles, X } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher.tsx";
import AnimatedNumber from "./AnimatedNumber.tsx";
import ProfileSwitcher from "./ProfileSwitcher.tsx";

export default function TopBar({
  themeId,
  onThemeChange,
  completion,
  reduceMotion,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onAddProfile,
  onRemoveProfile,
  onBackToIntro,
  assessment,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 860px)");
    const handleChange = () => setMenuOpen(false);

    handleChange();
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const renderProfileControls = () => (
    <ProfileSwitcher
      profiles={profiles}
      activeProfileId={activeProfileId}
      onSwitch={onSwitchProfile}
      onAdd={onAddProfile}
      onRemove={onRemoveProfile}
    />
  );

  const renderUtilityControls = () => (
    <>
      {onBackToIntro ? (
        <button type="button" className="secondary-button top-home-button" onClick={onBackToIntro}>
          <House size={16} aria-hidden="true" />
          返回主页
        </button>
      ) : null}
      <span className="privacy-chip">
        <ShieldCheck size={16} aria-hidden="true" />
        本地计算
      </span>
      <ThemeSwitcher themeId={themeId} onThemeChange={onThemeChange} />
    </>
  );

  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand-symbol" aria-hidden="true">
          <Sparkles size={24} />
        </span>
        <div>
          <strong>人格评估</strong>
          <span>{assessment.brandSubtitle}</span>
        </div>
      </div>

      <div className="mobile-top-controls">
        <span className="completion-chip">
          <AnimatedNumber value={completion.percent} suffix="%" disabled={reduceMotion} />
        </span>
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={menuOpen ? "收起设置菜单" : "展开设置菜单"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </div>

      <div className="top-actions">
        {renderProfileControls()}
        {renderUtilityControls()}
        <span className="completion-chip">
          <AnimatedNumber value={completion.percent} suffix="%" disabled={reduceMotion} />
        </span>
      </div>

      <div className={menuOpen ? "mobile-actions-panel open" : "mobile-actions-panel"} hidden={!menuOpen}>
        {renderProfileControls()}
        {renderUtilityControls()}
      </div>
    </header>
  );
}
