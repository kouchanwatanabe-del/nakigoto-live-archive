"use client";

import { useEffect, useState } from "react";

type Props = {
  liveId: string;
  variant?: "circle" | "wide";
};

export default function AttendedIconButton({
  liveId,
  variant = "circle",
}: Props) {
  const [attended, setAttended] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ========================================
  // 参戦記録を読み込み
  // ========================================

  useEffect(() => {
    const saved =
      localStorage.getItem("attendedLives");

    if (saved) {
      try {
        const attendedLives: string[] =
          JSON.parse(saved);

        setAttended(
          attendedLives.includes(liveId)
        );
      } catch {
        setAttended(false);
      }
    }

    setLoaded(true);
  }, [liveId]);

  // ========================================
  // 参戦 ON / OFF
  // ========================================

  const toggleAttended = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    // 親のLinkなどにクリックを伝えない
    e.preventDefault();
    e.stopPropagation();

    const saved =
      localStorage.getItem("attendedLives");

    let attendedLives: string[] = [];

    if (saved) {
      try {
        attendedLives =
          JSON.parse(saved);
      } catch {
        attendedLives = [];
      }
    }

    let updatedLives: string[];

    if (
      attendedLives.includes(liveId)
    ) {
      updatedLives =
        attendedLives.filter(
          (id) => id !== liveId
        );

      setAttended(false);
    } else {
      updatedLives = [
        ...attendedLives,
        liveId,
      ];

      setAttended(true);
    }

    localStorage.setItem(
      "attendedLives",
      JSON.stringify(updatedLives)
    );
  };

  // ========================================
  // 読み込み中
  // ========================================

  if (!loaded) {
    if (variant === "wide") {
      return (
        <div
          className="
            h-8
            w-[72px]
            rounded-full
            bg-zinc-100
          "
        />
      );
    }

    return (
      <div
        className="
          h-9
          w-9
          rounded-full
          bg-zinc-100
        "
      />
    );
  }

  // ========================================
  // 横長ボタン
  // LIVE LIST用
  // ========================================

  if (variant === "wide") {
    return (
      <button
        type="button"
        onClick={toggleAttended}
        aria-label={
          attended
            ? "参戦記録を解除"
            : "参戦記録に追加"
        }
        className={`
          flex
          h-8
          min-w-[72px]
          shrink-0
          items-center
          justify-center
          gap-1.5

          rounded-full
          border
          px-3

          text-[11px]
          font-bold

          shadow-[0_1px_3px_rgba(0,0,0,0.04)]

          transition-all
          duration-200

          hover:scale-[1.03]
          active:scale-95

          ${
            attended
              ? `
                border-[#14526B]
                bg-[#14526B]
                text-white
              `
              : `
                border-zinc-200
                bg-white
                text-[#14526B]
                hover:border-[#14526B]
              `
          }
        `}
      >
        <span
          className="
            text-[15px]
            leading-none
          "
        >
          {attended ? "♥" : "♡"}
        </span>

        <span>
          {attended
            ? "参戦済"
            : "参戦"}
        </span>
      </button>
    );
  }

  // ========================================
  // 丸ボタン
  // 従来版
  // ========================================

  return (
    <button
      type="button"
      onClick={toggleAttended}
      aria-label={
        attended
          ? "参戦記録を解除"
          : "参戦記録に追加"
      }
      className={`
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center

        rounded-full
        border

        text-[18px]

        transition-all
        duration-200

        active:scale-90

        ${
          attended
            ? `
              border-[#14526B]
              bg-[#14526B]
              text-white
            `
            : `
              border-zinc-200
              bg-white
              text-[#14526B]
              hover:border-[#14526B]
            `
        }
      `}
    >
      {attended ? "♥" : "♡"}
    </button>
  );
}