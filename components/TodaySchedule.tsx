"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { upcomingLives } from "../data/upcomingLives";
import { schedules, type ScheduleCategory } from "../data/schedules";

type TodayEvent = {
  id: string;
  category: ScheduleCategory;
  title: string;
  time?: string;
  href: string;
};

const categoryColors: Record<ScheduleCategory, { background: string; color: string }> = {
  LIVE: { background: "#14526B", color: "#FFFFFF" },
  RADIO: { background: "#E5EDF1", color: "#557889" },
  PODCAST: { background: "#EEEAF3", color: "#817995" },
  RELEASE: { background: "#E4EFEB", color: "#527C72" },
  OTHER: { background: "#EFEEEB", color: "#77746E" },
};

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
}

export default function TodaySchedule() {
  const [today, setToday] = useState("");

  useEffect(() => {
    const refresh = () => setToday(formatDate(new Date()));
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const events = useMemo<TodayEvent[]>(() => {
    if (!today) return [];

    const liveEvents: TodayEvent[] = upcomingLives
      .filter((live) => live.date === today)
      .map((live) => ({
        id: `live-${live.id}`,
        category: "LIVE",
        title: live.title,
        href: `/upcoming/${encodeURIComponent(live.id)}`,
      }));

    const otherEvents: TodayEvent[] = schedules
      .filter((event) => event.date === today)
      .map((event) => ({
        id: `schedule-${event.id}`,
        category: event.category,
        title: event.title,
        time: event.time,
        // 外部サイトではなくサイト内の詳細ページへ
        href: `/schedule/${encodeURIComponent(event.id)}`,
      }));

    // SCHEDULEページと同じ定期番組を、今日の予定にも表示する
    const [year, month, day] = today.split(".").map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();
    const recurring: TodayEvent[] = [];

    if (weekday === 5) {
      recurring.push({
        id: `ubugoe-${today}`,
        category: "PODCAST",
        title: 'Artistspoken「なきごとのUBUGOE」',
        time: "23:00",
        href: "/schedule/ubugoe",
      });
    }

    if (weekday === 3) {
      const weekNumber = Math.ceil(day / 7);
      if (weekNumber === 2 || weekNumber === 4) {
        recurring.push({
          id: `wear-music-${today}`,
          category: "RADIO",
          title: 'ZIP-FM「WEAR MUSIC」',
          time: "25:30〜26:00",
          href: "/schedule/wear-music",
        });
      }
    }

    return [...liveEvents, ...otherEvents, ...recurring]
      .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  }, [today]);

  const displayDate = today
    ? `${Number(today.slice(5, 7))}月${Number(today.slice(8, 10))}日`
    : "";

  return (
    <section className="mt-8">
      <div className="mb-3.5 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[22px] font-bold text-[#14526B]">TODAY</h2>
            {displayDate && (
              <span className="text-[12px] font-medium text-zinc-400">
                {displayDate}の予定
              </span>
            )}
          </div>
        </div>
        <Link
          href="/schedule"
          className="shrink-0 text-[13px] font-medium text-[#14526B] hover:underline"
        >
          VIEW ALL
        </Link>
      </div>

      {!today ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-5 text-center text-sm text-zinc-400">
          予定を読み込み中...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-6 text-center">
          <p className="text-[13px] font-medium text-zinc-500">今日の予定はありません</p>
          <Link href="/schedule" className="mt-2 inline-block text-[12px] font-semibold text-[#14526B]">
            今後の予定を見る ↗
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const colors = categoryColors[event.category];
            return (
              <Link
                key={event.id}
                href={event.href}
                className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-[#14526B] hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-[3px] px-2 py-1 text-[10px] font-bold"
                    style={{
                      backgroundColor: colors.background,
                      color: colors.color,
                    }}
                  >
                    {event.category}
                  </span>
                  {event.time && (
                    <span className="text-[12px] font-semibold text-zinc-500">
                      {event.time}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h3 className="min-w-0 text-[16px] font-bold leading-snug text-[#14526B]">
                    {event.title}
                  </h3>
                  <span aria-hidden="true" className="shrink-0 text-sm text-zinc-400">
                    ›
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
