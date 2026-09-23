"use client";

import { useEffect, useState } from "react";

const walkFrames = [
  "/歩く1.png",
  "/歩く2.png",
  "/歩く3.png",
  "/歩く4.png",
];

const runFrames = [
  "/走る1.png",
  "/走る2.png",
];

export default function IntroAnimation() {
  const [show, setShow] = useState(true);
  const [running, setRunning] = useState(false);
  const [frame, setFrame] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  /* ========================================
     歩く → 走る → イントロ終了
  ======================================== */

  useEffect(() => {
    // 1.4秒間歩いたあと走り出す
    const runTimer = setTimeout(() => {
      setRunning(true);
      setFrame(0);
    }, 1400);

    // 猫が走り去ったあと画面をフェード
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1950);

    // 完全に非表示
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 2350);

    return () => {
      clearTimeout(runTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  /* ========================================
     猫画像を切り替える
  ======================================== */

  useEffect(() => {
    const interval = setInterval(
      () => {
        setFrame((prev) => {
          const frameCount = running
            ? runFrames.length
            : walkFrames.length;

          return (prev + 1) % frameCount;
        });
      },

      // 歩きはゆっくり、走りは速く
      running ? 75 : 150
    );

    return () => {
      clearInterval(interval);
    };
  }, [running]);

  if (!show) return null;

  const currentImage = running
    ? runFrames[frame % runFrames.length]
    : walkFrames[frame % walkFrames.length];

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-all duration-500 ${
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

        {/* ========================================
            猫
        ======================================== */}

        <div className="intro-cat-track">
          <div
            className={`intro-cat ${
              running ? "intro-cat-running" : ""
            }`}
          >
            <img
              src={currentImage}
              alt=""
              draggable={false}
              className="intro-cat-image"
            />

            {/* 走っている時だけスピード線 */}
            <div
              className="intro-cat-speed-lines"
              aria-hidden="true"
            >
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