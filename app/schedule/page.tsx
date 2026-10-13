
"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { upcomingLives } from "../../data/upcomingLives";
import {
  schedules,
  type ScheduleCategory,
} from "../../data/schedules";

type Filter = "ALL" | ScheduleCategory;

type ScheduleEvent = {
  id: string;
  date: string;
  category: ScheduleCategory;
  title: string;
  time?: string;
  detail?: string;
  href?: string;
};

const categories: Filter[] = [
  "ALL",
  "LIVE",
  "RADIO",
  "PODCAST",
  "RELEASE",
  "OTHER",
];

const categoryColors: Record<
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

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
}


function CategoryLabel({
  category,
  small = false,
}: {
  category: ScheduleCategory;
  small?: boolean;
}) {
  const color = categoryColors[category];

  return (
    <span
      className={`block rounded-[3px] font-bold leading-tight ${
        small
          ? "w-full overflow-hidden whitespace-nowrap px-0.5 py-[3px] text-[9px] text-center"
          : "w-fit px-2 py-1 text-[10px]"
      }`}
      style={{
        backgroundColor: color.bg,
        color: color.text,
      }}
    >
      {category}
    </span>
  );
}


export default function SchedulePage() {
  const [filter, setFilter] = useState<Filter>("ALL");

  const [calendarDate, setCalendarDate] = useState(
    () => {
      const now = new Date();

      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }
  );

  const [today, setToday] = useState("");
  const [highlightedId, setHighlightedId] =
    useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const updateToday = () => {
      setToday(formatDate(new Date()));
    };

    updateToday();

    const timer = window.setInterval(
      updateToday,
      60 * 1000
    );

    return () => window.clearInterval(timer);
  }, []);

  // LIVEとその他の予定をまとめる
  const allEvents = useMemo<ScheduleEvent[]>(() => {
    const liveEvents: ScheduleEvent[] =
      upcomingLives.map((live) => ({
        id: `live-${live.id}`,
        date: live.date,
        category: "LIVE",
        title: live.title,
        detail: [live.city, live.venue]
          .filter(Boolean)
          .join(" / "),
        href: `/upcoming/${encodeURIComponent(
          live.id
        )}`,
      }));

    const otherEvents: ScheduleEvent[] =
      schedules.map((event) => ({
        ...event,
        id: `schedule-${event.id}`,
        href: event.url || undefined,
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
          filter === "ALL" ||
          event.category === filter
      ),
    [allEvents, filter]
  );

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const eventYears = allEvents.map((event) =>
      Number(event.date.slice(0, 4))
    );

    const minYear = Math.min(
      currentYear - 1,
      ...eventYears
    );

    const maxYear = Math.max(
      currentYear + 1,
      ...eventYears
    );

    return Array.from(
      { length: maxYear - minYear + 1 },
      (_, index) => maxYear - index
    );
  }, [allEvents]);

  const monthEvents = useMemo(() => {
    const prefix = `${year}.${String(
      month + 1
    ).padStart(2, "0")}.`;

    return filteredEvents.filter((event) =>
      event.date.startsWith(prefix)
    );
  }, [filteredEvents, year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();

    for (const event of monthEvents) {
      const current = map.get(event.date) ?? [];
      current.push(event);
      map.set(event.date, current);
    }

    return map;
  }, [monthEvents]);

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  function changeMonth(amount: number) {
    setHighlightedId(null);

    setCalendarDate(
      new Date(year, month + amount, 1)
    );
  }

  function jumpToMonth(
    nextYear: number,
    nextMonth: number
  ) {
    setHighlightedId(null);

    setCalendarDate(
      new Date(nextYear, nextMonth, 1)
    );
  }

  // 日付を押したら下の予定へ移動
  function scrollToEvent(eventId: string) {
    const element = document.getElementById(
      `schedule-event-${eventId}`
    );

    if (!element) return;

    setHighlightedId(eventId);

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.setTimeout(() => {
      setHighlightedId(null);
    }, 1400);
  }

  // スマホで左右スワイプ
  function handleTouchEnd(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const diffX =
      event.changedTouches[0].clientX -
      touchStartX.current;

    const diffY =
      event.changedTouches[0].clientY -
      touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(diffY) > Math.abs(diffX)) {
      return;
    }

    if (Math.abs(diffX) < 55) return;

    changeMonth(diffX < 0 ? 1 : -1);
  }

  return (
    <main className="min-h-screen bg-white pb-28 text-[#14526B]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">
          SCHEDULE
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          なきごとの活動予定
        </p>

        {/* カテゴリ */}
        <div className="mt-7 flex flex-wrap gap-2 border-b border-zinc-200 pb-5">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setFilter(category);
                setHighlightedId(null);
              }}
              className={`rounded-full border px-3 py-2 text-[11px] font-bold transition ${
                filter === category
                  ? "border-[#14526B] bg-[#14526B] text-white"
                  : "border-zinc-200 bg-white text-[#14526B]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 年月切り替え */}
        <div className="mt-7 flex items-center justify-between px-1">
          <button
            type="button"
            aria-label="前の月"
            onClick={() => changeMonth(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[25px] font-light text-[#14526B] active:bg-zinc-100"
          >
            ‹
          </button>

          <div className="flex items-center justify-center gap-1">
            <div className="relative">
              <select
                aria-label="年を選択"
                value={year}
                onChange={(e) =>
                  jumpToMonth(
                    Number(e.target.value),
                    month
                  )
                }
                className="cursor-pointer appearance-none bg-transparent py-2 pl-2 pr-5 text-[17px] font-bold tracking-tight text-[#14526B] outline-none"
              >
                {availableYears.map((value) => (
                  <option key={value} value={value}>
                    {value}年
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[9px]">
                ▼
              </span>
            </div>

            <div className="relative">
              <select
                aria-label="月を選択"
                value={month}
                onChange={(e) =>
                  jumpToMonth(
                    year,
                    Number(e.target.value)
                  )
                }
                className="cursor-pointer appearance-none bg-transparent py-2 pl-1 pr-5 text-[17px] font-bold tracking-tight text-[#14526B] outline-none"
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

              <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[9px]">
                ▼
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label="次の月"
            onClick={() => changeMonth(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[25px] font-light text-[#14526B] active:bg-zinc-100"
          >
            ›
          </button>
        </div>

        {/* カレンダー */}
        <div
          className="mt-2 touch-pan-y select-none"
          onTouchStart={(e) => {
            touchStartX.current =
              e.touches[0].clientX;

            touchStartY.current =
              e.touches[0].clientY;
          }}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStartX.current = null;
            touchStartY.current = null;
          }}
        >
          {/* 曜日 */}
          <div className="grid grid-cols-7 border-b border-zinc-100">
            {[
              "日", "月", "火", "水",
              "木", "金", "土",
            ].map((weekday) => (
              <div
                key={weekday}
                className="py-2 text-center text-[10px] font-bold text-zinc-400"
              >
                {weekday}
              </div>
            ))}
          </div>

          {/* 日付 */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[88px] border-b border-zinc-100 bg-zinc-50/30"
                  />
                );
              }

              const date = [
                year,
                String(month + 1).padStart(2, "0"),
                String(day).padStart(2, "0"),
              ].join(".");

              const dayEvents =
                eventsByDate.get(date) ?? [];

              const hasEvents =
                dayEvents.length > 0;

              const uniqueCategories = [
                ...new Set(
                  dayEvents.map(
                    (event) => event.category
                  )
                ),
              ];

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => {
                    if (!hasEvents) return;

                    scrollToEvent(dayEvents[0].id);
                  }}
                  className={`relative flex min-h-[88px] min-w-0 flex-col items-start justify-start border-b border-zinc-100 px-1 py-1.5 text-left align-top transition ${
                    hasEvents
                      ? "cursor-pointer bg-[#14526B]/15 active:bg-[#14526B]/20"
                      : "bg-white"
                  }`}
                >
                  {/* 日付 */}
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                      today === date
                        ? "bg-[#14526B] text-white"
                        : hasEvents
                          ? "text-[#14526B]"
                          : "text-zinc-500"
                    }`}
                  >
                    {day}
                  </div>

                  {/* カテゴリ名 */}
                  {hasEvents && (
                    <div className="mt-0.5 flex w-full min-w-0 flex-col gap-1">
                      {uniqueCategories.map(
                        (category) => (
                          <CategoryLabel
                            key={category}
                            category={category}
                            small
                          />
                        )
                      )}
                    </div>
                  )}

                  {/* 同日の予定件数 */}
                  {dayEvents.length > 1 && (
                    <p className="mt-1 text-[8px] font-medium text-zinc-500">
                      {dayEvents.length}件
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* この月の予定 */}
        <section className="mt-7">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400">
              {month + 1}月の予定
            </p>

            <p className="text-[10px] text-zinc-400">
              {monthEvents.length}件
            </p>
          </div>

          {monthEvents.length > 0 ? (
            <div className="border-y border-zinc-200">
              {monthEvents.map((event) => (
                <div
                  key={event.id}
                  id={`schedule-event-${event.id}`}
                  className={`scroll-mt-24 border-b border-zinc-100 transition-colors duration-500 last:border-b-0 ${
                    highlightedId === event.id
                      ? "bg-[#14526B]/10"
                      : "bg-white"
                  }`}
                >
                  <div className="py-2">
                    <p className="text-[10px] font-bold text-[#14526B]">
                      {event.date}
                      {event.time && (
                        <span className="ml-2 text-zinc-400">
                          {event.time}
                        </span>
                      )}
                    </p>

                    <div className="mt-1">
                      <CategoryLabel
                        category={event.category}
                      />
                    </div>

                    {event.href ? (
                      <Link
                        href={event.href}
                        className="mt-1 block"
                      >
                        <h3 className="text-[13px] font-bold leading-[1.4] text-[#14526B]">
                          {event.title}
                        </h3>

                        {event.detail && (
                          <p className="mt-1 text-[12px] leading-snug text-zinc-400">
                            {event.detail}
                          </p>
                        )}

                        
                      </Link>
                    ) : (
                      <div className="mt-1.5">
                        <h3 className="text-[13px] font-bold leading-[1.4] text-[#14526B]">
                          {event.title}
                        </h3>

                        {event.detail && (
                          <p className="mt-1 text-[12px] leading-snug text-zinc-400">
                            {event.detail}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-t border-zinc-200 py-10 text-center">
              <p className="text-[13px] text-zinc-400">
                この月の予定はありません
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
