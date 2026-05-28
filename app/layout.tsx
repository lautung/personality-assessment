import "../src/styles.css";

export const metadata = {
  title: "人格评估 | 五维人格探索",
  description: "一个本地计算、无需登录的人格评估网页，用五个维度帮助你整理当前的行为倾向。",
  openGraph: {
    title: "人格评估 | 五维人格探索",
    description: "一个本地计算、无需登录的人格评估网页，用五个维度帮助你整理当前的行为倾向。",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport = {
  themeColor: "#087c78",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
