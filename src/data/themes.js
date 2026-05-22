export const defaultThemeId = "mist";

export const themes = [
  {
    id: "mist",
    label: "晨雾浅色",
    description: "冷灰、白底与沉稳青绿",
    tone: "light",
  },
  {
    id: "night",
    label: "夜航深色",
    description: "深色背景与高对比数据色",
    tone: "dark",
  },
  {
    id: "paper",
    label: "纸本暖色",
    description: "温暖纸张感与低饱和琥珀",
    tone: "warm",
  },
];

export function isValidTheme(themeId) {
  return themes.some((theme) => theme.id === themeId);
}
