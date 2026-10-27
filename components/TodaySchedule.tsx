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

const categoryColors: Record<ScheduleCategory, { bg: string; text: string }> = {
  LIVE: { bg: "#D6EBF1", text: "#14526B" },
  RADIO: { bg: "#E5EDF1", text: "#557889" },
  PODCAST: { bg: "#EEEAF3", text: "#817995" },
  RELEASE: { bg: "#E4EFEB", text: "#527C72" },
  OTHER: { bg: "#EFEEEB", text: "#77746E" },
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
    const update = () => setToday(formatDate(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
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
        href: `/schedule/${encodeURIComponent(event.id)}`,
      }));

    const [year, month, day] = today.split(".").map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
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

    if (weekday === 3 && [2, 4].includes(Math.ceil(day / 7))) {
      recurring.push({
        id: `wear-music-${today}`,
        category: "RADIO",
        title: 'ZIP-FM「WEAR MUSIC」',
        time: "25:30〜26:00",
        // 日付付きIDは既存の詳細ページでも認識できる
        href: `/schedule/wear-music-${today}`,
      });
    }

    return [...liveEvents, ...otherEvents, ...recurring].sort(
      (a, b) => (a.time ?? "").localeCompare(b.time ?? "")
    );
  }, [today]);

  const dateLabel = today
    ? `${Number(today.slice(5, 7))}月${Number(today.slice(8, 10))}日`
    : "";

  return (
    <section className="mt-8">
      <div className="relative overflow-hidden rounded-xl bg-[#14526B] px-5 py-5 text-white shadow-sm sm:px-6 sm:py-6">
        {/* 画像なしで、D案のライブ感を光のグラデーションで表現 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 88% 6%, rgba(166,215,225,.30), transparent 50%), radial-gradient(ellipse at 18% 115%, rgba(2,30,47,.75), transparent 58%), linear-gradient(115deg, #10465D 0%, #14526B 60%, #37758B 100%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[26px] font-bold leading-none tracking-tight">TODAY</h2>
              <p className="mt-2 text-[12px] font-medium text-white/80">
                {dateLabel ? `${dateLabel}の予定` : "今日の予定"}
              </p>
            </div>
            <Link
              href="/schedule"
              className="shrink-0 pt-1 text-[12px] font-semibold text-white hover:underline"
            >
              VIEW ALL
            </Link>
          </div>

          {!today ? (
            <p className="mt-7 text-sm text-white/75">予定を読み込み中...</p>
          ) : events.length === 0 ? (
            <div className="mt-6 border-t border-white/20 pt-5">
              <p className="text-[14px] font-semibold">今日の予定はありません</p>
              <Link href="/schedule" className="mt-2 inline-block text-[12px] text-white/80 underline underline-offset-4">
                今後の予定を見る
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {events.map((event) => {
                const colors = categoryColors[event.category];
                return (
                  <Link
                    key={event.id}
                    href={event.href}
                    className="group block rounded-lg border border-white/15 bg-white/10 px-3.5 py-3 transition hover:bg-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-[4px] px-2 py-1 text-[10px] font-bold"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {event.category}
                      </span>
                      {event.time && (
                        <span className="text-[12px] font-medium text-white/85">{event.time}</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <h3 className="min-w-0 text-[15px] font-bold leading-snug sm:text-[16px]">
                        {event.title}
                      </h3>
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/60 text-lg transition group-hover:bg-white group-hover:text-[#14526B]"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
