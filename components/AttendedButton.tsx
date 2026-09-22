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
      <div className="h-9 w-36 rounded-full bg-zinc-100" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleAttended}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-4 text-[12px] font-bold transition ${
        attended
          ? "border-[#14526B] bg-[#14526B] text-white"
          : "border-zinc-200 bg-white text-[#14526B] hover:border-[#14526B]"
      }`}
    >
      <span className="text-[14px] leading-none">
        {attended ? "♥" : "♡"}
      </span>

      <span>
        {attended
          ? "参戦済み"
          : "このライブに参戦した"}
      </span>
    </button>
  );
}