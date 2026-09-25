"use client";

import { useEffect, useState } from "react";

type Props = {
  liveId: string;
};

export default function AttendedIconButton({
  liveId,
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
    // 親のリンクなどにクリックを伝えない
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
  // 丸ボタン
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

        text-[17px]
        leading-none

        shadow-[0_1px_3px_rgba(0,0,0,0.04)]

        transition-all
        duration-200

        hover:scale-105
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