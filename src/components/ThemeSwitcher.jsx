import { Moon, Palette, Sun } from "lucide-react";
import { themes } from "../data/themes.js";

const themeIcons = {
  mist: Sun,
  night: Moon,
  paper: Palette,
};

export default function ThemeSwitcher({ themeId, onThemeChange }) {
  const selectedIndex = Math.max(
    0,
    themes.findIndex((theme) => theme.id === themeId),
  );

  return (
    <div className="theme-switcher" aria-label="切换主题" style={{ "--theme-index": selectedIndex }}>
      {themes.map((theme, index) => {
        const Icon = themeIcons[theme.id];
        const selected = theme.id === themeId;
        return (
          <button
            key={theme.id}
            type="button"
            className={selected ? "theme-option selected" : "theme-option"}
            aria-pressed={selected}
            aria-label={theme.label}
            title={theme.description}
            style={{ "--theme-option-index": index }}
            onClick={() => onThemeChange(theme.id)}
          >
            <Icon size={15} aria-hidden="true" />
            <span>{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
}
