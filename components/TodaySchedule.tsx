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

function getJapanToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}.${part("month")}.${part("day")}`;
}

function getRecurringToday(dateString: string): TodayEvent[] {
  const [year, month, day] = dateString.split(".").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.getDay();
  const events: TodayEvent[] = [];

  if (weekday === 5) {
    events.push({
      id: "recurring-ubugoe",
      category: "PODCAST",
      title: 'Artistspoken「なきごとのUBUGOE」',
      time: "23:00",
      href: "/schedule/ubugoe",
    });
  }

  if (weekday === 3) {
    const nthWednesday = Math.ceil(day / 7);
    if (nthWednesday === 2 || nthWednesday === 4) {
      events.push({
        id: "recurring-wear-music",
        category: "RADIO",
        title: 'ZIP-FM「WEAR MUSIC」',
        time: "25:30〜26:00",
        href: "/schedule/wear-music",
      });
    }
  }

  return events;
}

export default function TodaySchedule() {
  const [today, setToday] = useState("");

  useEffect(() => {
    const refresh = () => setToday(getJapanToday());
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
        href: `/schedule/${encodeURIComponent(event.id)}`,
      }));

    const recurringEvents = getRecurringToday(today);
    const combined = [...liveEvents, ...otherEvents, ...recurringEvents];

    // 固定予定としても登録されている場合、同じ番組の二重表示を防ぐ
    return combined
      .filter((event, index, all) =>
        all.findIndex((item) => item.category === event.category && item.title === event.title) === index
      )
      .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  }, [today]);

  return (
    <section className="mt-8">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#14526B]">TODAY&apos;S SCHEDULE</h2>
        <Link href="/schedule" className="text-[13px] font-medium text-[#14526B] hover:underline">
          VIEW ALL
        </Link>
      </div>

      <div className="space-y-2">
        {!today ? (
          <div className="rounded-xl border border-zinc-200 px-4 py-5 text-center text-sm text-zinc-400">
            予定を読み込み中...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-5 text-center text-sm text-zinc-400">
            本日の予定はありません。
          </div>
        ) : (
          events.map((event) => {
            const colors = categoryColors[event.category];
            return (
              <Link
                key={event.id}
                href={event.href}
                className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-[#14526B] hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-2 py-1 text-[10px] font-bold"
                    style={{ backgroundColor: colors.background, color: colors.color }}
                  >
                    {event.category}
                  </span>
                  {event.time && <span className="text-xs text-zinc-500">{event.time}</span>}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h3 className="text-[16px] font-bold leading-snug text-[#14526B]">{event.title}</h3>
                  <span className="shrink-0 text-xs text-zinc-400">＞</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
