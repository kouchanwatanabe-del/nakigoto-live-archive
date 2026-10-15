
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
          UNOFFICIAL FANSITE
        </p>

        <h1 className="animate-intro-logo text-[44px] font-black tracking-tight text-[#14526B]">
          なきごと
        </h1>

        {/* 5つの丸が順番に跳ねるアニメーション */}
        <div
          className="mt-5 flex items-center justify-center gap-2"
          role="status"
          aria-label="読み込み中"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#14526B]"
              style={{
                animationDelay: `${i * 120}ms`,
                animationDuration: "1.2s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
