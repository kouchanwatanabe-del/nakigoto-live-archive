"use client";

import { useEffect, useState } from "react";

export default function IntroAnimation() {
  const [show, setShow] = useState(true);
  const [running, setRunning] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // ここまではゆっくり歩く
    const runTimer = setTimeout(() => {
      setRunning(true);
    }, 1350);

    // 猫が走り去ったあと画面を消し始める
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

        {/* 猫ローディング */}
        <div className="cat-loading-area">
          <div
            className={`cat-silhouette ${
              running ? "cat-silhouette-running" : ""
            }`}
          >
            <svg
              viewBox="0 0 160 100"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="cat-svg"
            >
              {/* しっぽ */}
              <path
                d="
                  M126 48
                  C143 43 148 28 146 14
                  C145 7 149 4 153 8
                  C160 18 157 39 151 50
                  C146 59 139 64 130 67
                  Z
                "
                fill="currentColor"
              />

              {/* 胴体 */}
              <path
                d="
                  M42 43
                  C59 35 84 34 101 37
                  C115 39 123 45 134 48
                  C140 51 142 57 138 62
                  C132 68 121 70 109 69
                  C96 68 86 65 75 65
                  C63 65 54 69 44 66
                  C35 63 31 55 34 49
                  C36 46 39 44 42 43
                  Z
                "
                fill="currentColor"
              />

              {/* 首 */}
              <path
                d="
                  M38 44
                  C33 38 27 34 22 32
                  L27 51
                  C31 57 35 62 42 65
                  L50 54
                  Z
                "
                fill="currentColor"
              />

              {/* 頭 */}
              <path
                d="
                  M7 32
                  C14 27 20 27 27 31
                  C34 35 38 42 36 49
                  C34 56 26 59 17 57
                  L4 59
                  C1 59 -1 56 1 52
                  L5 44
                  Z
                "
                fill="currentColor"
              />

              {/* 耳 */}
              <path
                d="
                  M8 34
                  L10 19
                  C10 17 12 17 13 19
                  L23 30
                  Z
                "
                fill="currentColor"
              />

              {/* 前足1 */}
              <path
                className="cat-svg-leg cat-svg-leg-a"
                d="
                  M105 63
                  C111 66 116 69 120 74
                  C123 78 123 82 120 86
                  L114 93
                  C112 96 107 95 106 92
                  C105 90 107 88 109 86
                  L114 80
                  C110 76 105 73 99 70
                  Z
                "
                fill="currentColor"
              />

              {/* 前足2 */}
              <path
                className="cat-svg-leg cat-svg-leg-b"
                d="
                  M124 63
                  C130 66 134 70 135 75
                  L132 92
                  C132 96 128 98 125 96
                  C123 95 123 92 124 90
                  L126 76
                  C123 73 119 71 115 69
                  Z
                "
                fill="currentColor"
              />

              {/* 後ろ足1 */}
              <path
                className="cat-svg-leg cat-svg-leg-b"
                d="
                  M49 61
                  C45 69 41 77 35 84
                  L27 92
                  C24 95 18 95 17 91
                  C16 88 19 86 22 85
                  L28 79
                  C33 71 35 64 36 56
                  Z
                "
                fill="currentColor"
              />

              {/* 後ろ足2 */}
              <path
                className="cat-svg-leg cat-svg-leg-a"
                d="
                  M66 62
                  C68 69 73 75 78 81
                  C82 85 82 89 79 93
                  C76 96 70 96 68 93
                  C67 90 70 88 72 86
                  C67 80 61 75 57 68
                  Z
                "
                fill="currentColor"
              />
            </svg>

            {/* 走り出した時のスピード線 */}
            <div className="cat-run-lines" aria-hidden="true">
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