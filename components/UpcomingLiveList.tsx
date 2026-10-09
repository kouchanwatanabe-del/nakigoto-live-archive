"use client";

import Link from "next/link";
import { upcomingLives } from "../data/upcomingLives";

export default function UpcomingLiveList({ keyword = "" }: { keyword?: string }) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
  const q = keyword.trim().toLowerCase();
  const schedule = upcomingLives
    .filter((live) => live.date >= todayKey)
    .filter((live) => [live.title, live.city, live.venue, live.tour, live.memo, ...(live.artists ?? [])].some((value) => value.toLowerCase().includes(q)))
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="mt-4 -mx-4 border-y border-zinc-200 bg-white sm:-mx-6">
      {schedule.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-zinc-500">今後の公演予定はありません</p>
      ) : schedule.map((live, index) => (
        <Link key={live.id} href={`/upcoming/${encodeURIComponent(live.id)}`} className={`block px-4 py-3 transition hover:bg-zinc-50 sm:px-6 ${index ? "border-t border-zinc-200" : ""}`}>
          <div className="flex items-center gap-2"><span className="text-xs font-bold text-[#14526B]">{live.date}</span><span className="rounded-full bg-[#14526B]/10 px-2 py-0.5 text-[9px] font-bold text-[#14526B]">UPCOMING</span></div>
          <h2 className="mt-1 text-[15px] font-bold text-[#14526B]">{live.title}</h2>
          <p className="mt-1 text-xs text-zinc-500"><span className="font-semibold text-[#14526B]">{live.city}</span> ｜ {live.venue}</p>
          {live.tour && <p className="mt-1 text-[11px] text-zinc-500">{live.tour}</p>}
        </Link>
      ))}
    </div>
  );
}
