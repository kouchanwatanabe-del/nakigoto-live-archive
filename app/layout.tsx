import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BottomNav from "../components/BottomNav";
import IntroAnimation from "../components/IntroAnimation";
import PageTransition from "../components/PageTransition";
import SiteHeader from "../components/SiteHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "なきごと LIVE ARCHIVE",
  description: "なきごとのライブ・セットリスト・ツアー記録",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-dvh bg-white`}>

        <IntroAnimation />

        {/* 上部固定ヘッダー */}
        <SiteHeader />

        <PageTransition>
          {children}
        </PageTransition>

        <BottomNav />

      </body>
    </html>
  );
}