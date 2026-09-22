"use client";

import { useEffect, useState } from "react";

export default function IntroAnimation() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1.4秒後にフェードアウト開始
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1400);

    // 1.9秒後に完全に非表示
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-all duration-500 ${
        fadeOut
          ? "-translate-y-4 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      <div className="text-center">

        <p className="mb-3 text-[10px] font-medium tracking-[0.35em] text-zinc-400">
          UNOFFICIAL LIVE ARCHIVE
        </p>

        <h1 className="animate-intro-logo text-[44px] font-black tracking-tight text-[#14526B]">
          なきごと
        </h1>

       <div className="mx-auto mt-5 h-[2px] w-40 overflow-hidden rounded-full bg-zinc-100">
  <div className="intro-line h-full bg-[#14526B]" />
</div>

      </div>
    </div>
  );
}