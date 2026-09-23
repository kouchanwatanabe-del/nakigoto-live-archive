"use client";

import { useEffect, useState } from "react";

export default function IntroAnimation() {
  const [show, setShow] = useState(true);
  const [running, setRunning] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // トコトコ歩いたあと、走り出す
    const runTimer = setTimeout(() => {
      setRunning(true);
    }, 1350);

    // 猫が画面外へ出てからフェードアウト
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1850);

    // 完全に非表示
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 2250);

    return () => {
      clearTimeout(runTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-all duration-400 ${
        fadeOut
          ? "-translate-y-3 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      <div className="w-full text-center">
        <p className="mb-3 text-[10px] font-medium tracking-[0.35em] text-zinc-400">
          UNOFFICIAL LIVE ARCHIVE
        </p>

        <h1 className="animate-intro-logo text-[44px] font-black tracking-tight text-[#14526B]">
          なきごと
        </h1>

        {/* 猫ローディング */}
        <div className="cat-track">
          <div className={`loading-cat ${running ? "cat-running" : ""}`}>
            {/* しっぽ */}
            <div className="cat-tail" />

            {/* 胴体 */}
            <div className="cat-body" />

            {/* 頭 */}
            <div className="cat-head">
              <span className="cat-ear cat-ear-left" />
              <span className="cat-ear cat-ear-right" />
            </div>

            {/* 足 */}
            <span className="cat-leg cat-leg-1" />
            <span className="cat-leg cat-leg-2" />
            <span className="cat-leg cat-leg-3" />
            <span className="cat-leg cat-leg-4" />

            {/* 走り出したときのスピード線 */}
            <div className="cat-speed-lines">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}