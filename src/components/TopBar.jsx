import { ShieldCheck, Sparkles } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import AnimatedNumber from "./AnimatedNumber.jsx";

export default function TopBar({ themeId, onThemeChange, completion, reduceMotion }) {
  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand-symbol" aria-hidden="true">
          <Sparkles size={24} />
        </span>
        <div>
          <strong>人格评估</strong>
          <span>五维自我探索</span>
        </div>
      </div>

      <div className="top-actions">
        <span className="privacy-chip">
          <ShieldCheck size={16} aria-hidden="true" />
          本地计算
        </span>
        <span className="completion-chip">
          <AnimatedNumber value={completion.percent} suffix="%" disabled={reduceMotion} />
        </span>
        <ThemeSwitcher themeId={themeId} onThemeChange={onThemeChange} />
      </div>
    </header>
  );
}
