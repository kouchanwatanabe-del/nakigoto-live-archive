import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BottomNav from "../components/BottomNav";
import "./globals.css";
import IntroAnimation from "../components/IntroAnimation";

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

  {children}

  <BottomNav />
</body>
    </html>
  );
}