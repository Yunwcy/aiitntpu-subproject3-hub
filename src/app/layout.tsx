import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Providers from "@/components/Providers";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-tc",
});

export const metadata: Metadata = {
  title: "ReVoice 子計畫三・專案管理中心",
  description:
    "以國科會 ReVoice 研究計畫子計畫三的實際工作內容為基礎，展示研究專案的時程規劃、團隊分工與 AI 智能進度摘要。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${notoSansTC.variable} font-sans antialiased`}>
        <Providers>
          <Nav />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-slate-400 sm:px-6">
            本專案為作品集展示用途，以真實研究計畫工作內容重現而成，資料經彙整簡化，非官方計畫系統。
          </footer>
        </Providers>
      </body>
    </html>
  );
}
