
"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { upcomingLives } from "../../data/upcomingLives";
import {
  schedules,
  type ScheduleCategory,
} from "../../data/schedules";

type CategoryFilter = "ALL" | ScheduleCategory;

type CalendarEvent = {
  id: string;
  date: string;
  category: ScheduleCategory;
  title: string;
  time?: string;
  detail?: string;
  href?: string;
};

const categories: CategoryFilter[] = [
  "ALL",
  "LIVE",
  "RADIO",
  "PODCAST",
  "RELEASE",
  "OTHER",
];

const categoryStyles: Record<
  ScheduleCategory,
  { bg: string; text: string }
> = {
  LIVE: {
    bg: "#14526B",
    text: "#FFFFFF",
  },
  RADIO: {
    bg: "#E5EDF1",
    text: "#557889",
  },
  PODCAST: {
    bg: "#EEEAF3",
    text: "#817995",
  },
  RELEASE: {
    bg: "#E4EFEB",
    text: "#527C72",
  },
  OTHER: {
    bg: "#EFEEEB",
    text: "#77746E",
  },
};

const weekdays = [
  "日", "月", "火", "水", "木", "金", "土",
];

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
}

function monthKey(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function CategoryLabel({
  category,
}: {
  category: ScheduleCategory;
}) {
  const style = categoryStyles[category];

  return (
    <span
      className="block rounded-[3px] px-0.5 py-[3px] text-center text-[8px] font-bold leading-none tracking-tight"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {category}
    </span>
  );
}

export default function SchedulePage() {
  const [category, setCategory] =
    useState<CategoryFilter>("ALL");

  const [currentMonth, setCurrentMonth] =
    useState(() => {
      const now = new Date();
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    });

  const [selectedDate, setSelectedDate] =
    useState(() => dateKey(new Date()));

  const [today, setToday] = useState("");

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setToday(dateKey(new Date()));
  }, []);

  // 既存のUPCOMING LIVEと新しい予定を統合
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const liveEvents: CalendarEvent[] =
      upcomingLives.map((live) => ({
        id: `live-${live.id}`,
        date: live.date,
        category: "LIVE",
        title: live.title,
        detail: [live.city, live.venue]
          .filter(Boolean)
          .join(" / "),
        href: `/upcoming/${encodeURIComponent(live.id)}`,
      }));

    const otherEvents: CalendarEvent[] =
      schedules.map((event) => ({
        ...event,
        href: event.url,
      }));

    return [...liveEvents, ...otherEvents].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.time ?? "").localeCompare(b.time ?? "")
    );
  }, []);

  const filteredEvents = useMemo(
    () =>
      allEvents.filter(
        (event) =>
          category === "ALL" ||
          event.category === category
      ),
    [allEvents, category]
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const event of filteredEvents) {
      const existing = map.get(event.date) ?? [];
      existing.push(event);
      map.set(event.date, existing);
    }

    return map;
  }, [filteredEvents]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstWeekday = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const cellCount =
    Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const calendarDays = Array.from(
    { length: cellCount },
    (_, index) => index - firstWeekday + 1
  );

  const selectedEvents =
    eventsByDate.get(selectedDate) ?? [];

  const monthEvents = filteredEvents.filter(
    (event) =>
      event.date.startsWith(
        `${year}.${String(month + 1).padStart(2, "0")}.`
      )
  );

  const availableYears = Array.from(
    new Set([
      year,
      new Date().getFullYear(),
      ...allEvents.map((event) =>
        Number(event.date.slice(0, 4))
      ),
    ])
  ).sort((a, b) => b - a);

  function moveMonth(amount: number) {
    const next = new Date(
      year,
      month + amount,
      1
    );

    setCurrentMonth(next);
    setSelectedDate(dateKey(next));
  }

  function selectMonth(
    nextYear: number,
    nextMonth: number
  ) {
    const next = new Date(
      nextYear,
      nextMonth,
      1
    );

    setCurrentMonth(next);
    setSelectedDate(dateKey(next));
  }

  function onTouchEnd(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    if (touchStartX.current === null) return;

    const distance =
      event.changedTouches[0].clientX -
      touchStartX.current;

    touchStartX.current = null;

    if (Math.abs(distance) < 60) return;

    moveMonth(distance < 0 ? 1 : -1);
  }

  return (
    <main className="min-h-screen bg-white pb-28 text-[#14526B]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-bold">
          SCHEDULE
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          なきごとの活動予定
        </p>

        {/* カテゴリ切り替え */}
        <div className="mt-7 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-3 py-2 text-[11px] font-bold transition ${
                category === item
                  ? "border-[#14526B] bg-[#14526B] text-white"
                  : "border-zinc-200 bg-white text-[#14526B]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* 年月ナビ */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            aria-label="前の月"
            onClick={() => moveMonth(-1)}
            className="rounded-full p-2"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex items-center gap-2">
            <select
              aria-label="年を選択"
              value={year}
              onChange={(e) =>
                selectMonth(
                  Number(e.target.value),
                  month
                )
              }
              className="bg-white text-base font-bold outline-none"
            >
              {availableYears.map((value) => (
                <option key={value} value={value}>
                  {value}年
                </option>
              ))}
            </select>

            <select
              aria-label="月を選択"
              value={month}
              onChange={(e) =>
                selectMonth(
                  year,
                  Number(e.target.value)
                )
              }
              className="bg-white text-base font-bold outline-none"
            >
              {Array.from(
                { length: 12 },
                (_, index) => (
                  <option
                    key={index}
                    value={index}
                  >
                    {index + 1}月
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            aria-label="次の月"
            onClick={() => moveMonth(1)}
            className="rounded-full p-2"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* カレンダー */}
        <div
          className="mt-5 touch-pan-y select-none"
          onTouchStart={(e) => {
            touchStartX.current =
              e.touches[0].clientX;
          }}
          onTouchEnd={onTouchEnd}
        >
          <div className="grid grid-cols-7">
            {weekdays.map((day, index) => (
              <div
                key={day}
                className={`pb-3 text-center text-xs font-medium ${
                  index === 0
                    ? "text-rose-400"
                    : index === 6
                      ? "text-sky-500"
                      : "text-zinc-400"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-zinc-100">
            {calendarDays.map((day, index) => {
              const valid =
                day >= 1 && day <= daysInMonth;

              if (!valid) {
                return (
                  <div
                    key={index}
                    className="min-h-[82px] border-b border-r border-zinc-100 bg-zinc-50/50"
                  />
                );
              }

              const date = [
                year,
                String(month + 1).padStart(2, "0"),
                String(day).padStart(2, "0"),
              ].join(".");

              const events =
                eventsByDate.get(date) ?? [];

              const uniqueCategories = [
                ...new Set(
                  events.map((event) => event.category)
                ),
              ];

              const selected =
                selectedDate === date;

              const isToday = today === date;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[82px] min-w-0 border-b border-r border-zinc-100 px-0.5 py-1 text-left align-top transition ${
                    selected
                      ? "bg-[#14526B]/[0.07]"
                      : "bg-white"
                  }`}
                >
                  <span
                    className={`mx-auto mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                      isToday
                        ? "bg-[#14526B] font-bold text-white"
                        : selected
                          ? "font-bold text-[#14526B]"
                          : "text-zinc-600"
                    }`}
                  >
                    {day}
                  </span>

                  <div className="space-y-0.5">
                    {uniqueCategories.map((item) => (
                      <CategoryLabel
                        key={item}
                        category={item}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 選択した日の予定 */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold">
              {selectedDate.replaceAll(".", "/")}
            </h2>

            <span className="text-xs text-zinc-400">
              {selectedEvents.length}件
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {selectedEvents.length === 0 ? (
              <p className="rounded-xl border border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
                この日の予定はありません。
              </p>
            ) : (
              selectedEvents.map((event) => {
                const style =
                  categoryStyles[event.category];

                const content = (
                  <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded px-2 py-1 text-[10px] font-bold"
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                        }}
                      >
                        {event.category}
                      </span>

                      {event.time && (
                        <span className="text-xs text-zinc-500">
                          {event.time}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-[16px] font-bold leading-snug">
                      {event.title}
                    </h3>

                    {event.detail && (
                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        {event.detail}
                      </p>
                    )}

                    {event.href && (
                      <p className="mt-2 text-right text-xs font-medium">
                        詳細を見る →
                      </p>
                    )}
                  </div>
                );

                return event.href ? (
                  <Link
                    key={event.id}
                    href={event.href}
                    className="block"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={event.id}>
                    {content}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 月間予定一覧 */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold">
              {month + 1}月の予定
            </h2>

            <span className="text-xs text-zinc-400">
              {monthEvents.length}件
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {monthEvents.length === 0 ? (
              <p className="text-sm text-zinc-400">
                登録されている予定はありません。
              </p>
            ) : (
              monthEvents.map((event) => {
                const style =
                  categoryStyles[event.category];

                const card = (
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 py-3">
                    <span className="w-12 shrink-0 text-xs font-bold">
                      {event.date.slice(5)}
                    </span>

                    <span
                      className="w-[3px] self-stretch rounded-full"
                      style={{
                        backgroundColor: style.bg,
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <span
                        className="text-[10px] font-bold"
                        style={{
                          color:
                            event.category === "LIVE"
                              ? "#14526B"
                              : style.text,
                        }}
                      >
                        {event.category}
                      </span>

                      <p className="mt-0.5 text-sm font-semibold">
                        {event.title}
                      </p>
                    </div>

                    {event.href && (
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-zinc-400"
                      />
                    )}
                  </div>
                );

                return event.href ? (
                  <Link
                    key={event.id}
                    href={event.href}
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={event.id}>
                    {card}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
