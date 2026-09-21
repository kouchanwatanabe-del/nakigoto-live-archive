"use client";

import { useEffect, useState } from "react";

type Props = {
  liveId: string;
};

export default function AttendedButton({ liveId }: Props) {
  const [attended, setAttended] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("attendedLives");

    if (saved) {
      try {
        const attendedLives: string[] = JSON.parse(saved);
        setAttended(attendedLives.includes(liveId));
      } catch {
        setAttended(false);
      }
    }

    setLoaded(true);
  }, [liveId]);

  const toggleAttended = () => {
    const saved = localStorage.getItem("attendedLives");

    let attendedLives: string[] = [];

    if (saved) {
      try {
        attendedLives = JSON.parse(saved);
      } catch {
        attendedLives = [];
      }
    }

    let updatedLives: string[];

    if (attendedLives.includes(liveId)) {
      updatedLives = attendedLives.filter(
        (id) => id !== liveId
      );

      setAttended(false);
    } else {
      updatedLives = [...attendedLives, liveId];

      setAttended(true);
    }

    localStorage.setItem(
      "attendedLives",
      JSON.stringify(updatedLives)
    );
  };

  if (!loaded) {
    return (
      <div className="mt-6 h-[48px] rounded-xl border border-zinc-200 bg-zinc-50" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleAttended}
      className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-bold transition ${
        attended
          ? "border-[#14526B] bg-[#14526B] text-white"
          : "border-zinc-200 bg-white text-[#14526B] hover:border-[#14526B]"
      }`}
    >
      <span className="text-[17px]">
        {attended ? "♥" : "♡"}
      </span>

      {attended
        ? "参戦済み"
        : "このライブに参戦した"}
    </button>
  );
}