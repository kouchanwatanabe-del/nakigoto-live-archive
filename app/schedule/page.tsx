"use client";

import Link from "next/link";

import { useEffect, useMemo, useRef, useState } from "react";

import type { TouchEvent, TransitionEvent } from "react";

import { upcomingLives } from "../../data/upcomingLives";

import { schedules, getRecurringSchedules, type ScheduleCategory } from "../../data/schedules";

type Filter = "ALL" | ScheduleCategory;

type ScheduleEvent = {

  id: string;

  date: string;

  category: ScheduleCategory;

  title: string;

  time?: string;

  detail?: string;

  city?: string;

  href?: string;

};

type CalendarPage = {

  year: number;

  month: number;

  days: (number | null)[];

  eventsByDate: Map<string, ScheduleEvent[]>;

};

const categories: Filter[] = ["ALL", "LIVE", "RADIO", "PODCAST", "RELEASE", "OTHER"];

const categoryColors: Record<ScheduleCategory, { bg: string; text: string }> = {

  LIVE: { bg: "#14526B", text: "#FFFFFF" },

  RADIO: { bg: "#E5EDF1", text: "#557889" },

  PODCAST: { bg: "#EEEAF3", text: "#817995" },

  RELEASE: { bg: "#E4EFEB", text: "#527C72" },

  OTHER: { bg: "#EFEEEB", text: "#77746E" },

};

const SWIPE_THRESHOLD = 55;
const MIN_MONTH = new Date(2026, 9, 1); // 2026年10月
const MAX_MONTH = (() => {
  // 追加されたLIVE予定のうち、最も先の公演月まで
  const latest = upcomingLives.reduce((max, live) => {
    const value = live.date.slice(0, 7);
    return value > max ? value : max;
  }, "2026.10");
  const [year, month] = latest.split(".").map(Number);
  return new Date(year, month - 1, 1);
})();

function monthIndex(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function clampMonth(date: Date) {
  if (monthIndex(date) < monthIndex(MIN_MONTH)) return new Date(MIN_MONTH);
  if (monthIndex(date) > monthIndex(MAX_MONTH)) return new Date(MAX_MONTH);
  return date;
}


function formatDate(date: Date) {

  return [

    date.getFullYear(),

    String(date.getMonth() + 1).padStart(2, "0"),

    String(date.getDate()).padStart(2, "0"),

  ].join(".");

}

function CategoryLabel({ category, small = false, label }: { category: ScheduleCategory; small?: boolean; label?: string }) {

  const color = categoryColors[category];

  return (

    <span

      className={small

        ? "block w-full rounded-[3px] px-0.5 py-[3px] text-center text-[9px] font-bold leading-tight"

        : "inline-block rounded-[3px] px-2 py-1 text-[10px] font-bold leading-tight"}

      style={{ backgroundColor: color.bg, color: color.text }}

    >

      {small && category === "LIVE" && label?.startsWith("LIVE・") ? (
        <span className="flex flex-col items-center gap-0.5">
          <span>LIVE</span>
          <span className="block w-full break-words text-[8px] leading-tight">
            {label.slice(5)}
          </span>
        </span>
      ) : (
        label ?? category
      )}

    </span>

  );

}

export default function SchedulePage() {

  const [filter, setFilter] = useState<Filter>("ALL");

  const [calendarDate, setCalendarDate] = useState(() => {

    const now = new Date();

    return clampMonth(new Date(now.getFullYear(), now.getMonth(), 1));

  });

  useEffect(() => {
    const saved = window.sessionStorage.getItem("nakigoto-schedule-month");
    if (!saved || !/^\d{4}-(0?[0-9]|1[01])$/.test(saved)) return;
    const [savedYear, savedMonth] = saved.split("-").map(Number);
    setCalendarDate(clampMonth(new Date(savedYear, savedMonth, 1)));
  }, []);

  function rememberCalendarMonth() {
    window.sessionStorage.setItem("nakigoto-schedule-month", `${year}-${month}`);
  }

  const [today, setToday] = useState("");

  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const [dragX, setDragX] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);

  const [containerWidth, setContainerWidth] = useState(0);

  const [resetting, setResetting] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const touchStartX = useRef<number | null>(null);

  const touchStartY = useRef<number | null>(null);

  const horizontalGesture = useRef(false);

  const pendingDirection = useRef<-1 | 0 | 1>(0);

  useEffect(() => {

    const updateToday = () => setToday(formatDate(new Date()));

    updateToday();

    const timer = window.setInterval(updateToday, 60_000);

    return () => window.clearInterval(timer);

  }, []);

  useEffect(() => {

    const node = containerRef.current;

    if (!node) return;

    const updateWidth = () => setContainerWidth(node.clientWidth);

    updateWidth();

    const observer = new ResizeObserver(updateWidth);

    observer.observe(node);

    return () => observer.disconnect();

  }, []);

  const allEvents = useMemo<ScheduleEvent[]>(() => {

    const liveEvents: ScheduleEvent[] = upcomingLives.map((live) => ({

      id: `live-${live.id}`,

      date: live.date,

      category: "LIVE",

      title: live.title,

      detail: [live.city, live.venue].filter(Boolean).join(" / "),

      city: live.city,

      href: `/upcoming/${encodeURIComponent(live.id)}`,

    }));

    const otherEvents: ScheduleEvent[] = schedules.map((event) => ({

      ...event,

      id: `schedule-${event.id}`,

      href: `/schedule/${encodeURIComponent(event.id)}`,

    }));

    return [...liveEvents, ...otherEvents].sort(

      (a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")

    );

  }, []);

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  // 前月・表示月・翌月を生成し、スワイプ中も予定を表示
  const filteredEvents = useMemo(() => {
    const recurringEvents = [-1, 0, 1].flatMap((offset) => {
      const date = new Date(year, month + offset, 1);
      return getRecurringSchedules(date.getFullYear(), date.getMonth());
    });

    return [
      ...allEvents,
      ...recurringEvents.map((event) => ({
        ...event,
        href: event.id.startsWith("ubugoe-")
          ? "/schedule/ubugoe"
          : `/schedule/${encodeURIComponent(event.id)}`,
      })),
    ]
      .filter((event) => filter === "ALL" || event.category === filter)
      .sort((a, b) =>
        a.date.localeCompare(b.date) ||
        (a.time ?? "").localeCompare(b.time ?? "")
      );
  }, [allEvents, filter, year, month]);

  const availableYears = Array.from(
    { length: MAX_MONTH.getFullYear() - MIN_MONTH.getFullYear() + 1 },
    (_, index) => MIN_MONTH.getFullYear() + index
  );
  const canGoPrevious = monthIndex(calendarDate) > monthIndex(MIN_MONTH);
  const canGoNext = monthIndex(calendarDate) < monthIndex(MAX_MONTH);

  const monthEvents = useMemo(() => {

    const prefix = `${year}.${String(month + 1).padStart(2, "0")}.`;

    return filteredEvents.filter((event) => event.date.startsWith(prefix));

  }, [filteredEvents, year, month]);

  const calendarPages = useMemo<CalendarPage[]>(() => {

    return [-1, 0, 1].map((offset) => {

      const date = new Date(year, month + offset, 1);

      const pageYear = date.getFullYear();

      const pageMonth = date.getMonth();

      const firstDay = date.getDay();

      const daysInMonth = new Date(pageYear, pageMonth + 1, 0).getDate();

      const days: (number | null)[] = [

        ...Array.from({ length: firstDay }, () => null),

        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),

      ];

      while (days.length % 7 !== 0) days.push(null);

      const prefix = `${pageYear}.${String(pageMonth + 1).padStart(2, "0")}.`;

      const eventsByDate = new Map<string, ScheduleEvent[]>();

      for (const event of filteredEvents) {

        if (!event.date.startsWith(prefix)) continue;

        const dayEvents = eventsByDate.get(event.date) ?? [];

        dayEvents.push(event);

        eventsByDate.set(event.date, dayEvents);

      }

      return { year: pageYear, month: pageMonth, days, eventsByDate };

    });

  }, [year, month, filteredEvents]);

  function jumpToMonth(nextYear: number, nextMonth: number) {

    if (isAnimating || resetting) return;

    setHighlightedId(null);

    setDragX(0);

    setCalendarDate(clampMonth(new Date(nextYear, nextMonth, 1)));

  }

  function animateMonth(direction: -1 | 1) {

    if (isAnimating || resetting || !containerWidth) return;
    if (direction === -1 && !canGoPrevious) return;
    if (direction === 1 && !canGoNext) return;

    pendingDirection.current = direction;

    setIsDragging(false);

    setIsAnimating(true);

    setDragX(-direction * containerWidth);

  }

  function finishAnimation(event: TransitionEvent<HTMLDivElement>) {

    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;

    if (!isAnimating) return;

    const direction = pendingDirection.current;

    pendingDirection.current = 0;

    setIsAnimating(false);

    setResetting(true);

    setDragX(0);

    if (direction !== 0) {

      setHighlightedId(null);

      setCalendarDate((current) => clampMonth(new Date(current.getFullYear(), current.getMonth() + direction, 1)));

    }

    requestAnimationFrame(() => {

      requestAnimationFrame(() => setResetting(false));

    });

  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {

    if (isAnimating || resetting) return;

    touchStartX.current = event.touches[0].clientX;

    touchStartY.current = event.touches[0].clientY;

    horizontalGesture.current = false;

  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {

    if (isAnimating || resetting || touchStartX.current === null || touchStartY.current === null) return;

    const dx = event.touches[0].clientX - touchStartX.current;

    const dy = event.touches[0].clientY - touchStartY.current;

    if (!horizontalGesture.current) {

      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;

      if (Math.abs(dy) > Math.abs(dx)) return;

      horizontalGesture.current = true;

    }

    setIsDragging(true);

    const allowedDx = (dx > 0 && !canGoPrevious) || (dx < 0 && !canGoNext) ? 0 : dx;
    setDragX(Math.max(-containerWidth, Math.min(containerWidth, allowedDx)));

  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const dx = event.changedTouches[0].clientX - touchStartX.current;
    const dy = event.changedTouches[0].clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    const isHorizontal = horizontalGesture.current && Math.abs(dx) > Math.abs(dy);
    horizontalGesture.current = false;

    if (isAnimating || resetting || !isDragging) return;

    const direction: -1 | 1 = dx < 0 ? 1 : -1;
    const blocked =
      (direction === -1 && !canGoPrevious) ||
      (direction === 1 && !canGoNext);

    // 端の月や短いスワイプはアニメーション待ちにしない。
    // 移動距離が0のときは transitionend が発火しないため。
    if (!isHorizontal || Math.abs(dx) < SWIPE_THRESHOLD || blocked) {
      pendingDirection.current = 0;
      setIsDragging(false);
      setIsAnimating(false);
      setDragX(0);
      return;
    }

    pendingDirection.current = direction;
    setIsDragging(false);
    setIsAnimating(true);
    setDragX(-direction * containerWidth);
  }

  function handleTouchCancel() {
    touchStartX.current = null;
    touchStartY.current = null;
    horizontalGesture.current = false;
    pendingDirection.current = 0;

    // キャンセル時も transitionend を待たずに操作可能に戻す
    setIsDragging(false);
    setIsAnimating(false);
    setDragX(0);
  }

  function scrollToEvent(eventId: string) {

    const element = document.getElementById(`schedule-event-${eventId}`);

    if (!element) return;

    setHighlightedId(eventId);

    element.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(() => setHighlightedId(null), 1400);

  }

  function renderCalendarPage(page: CalendarPage) {

    return (

      <div key={`${page.year}-${page.month}`} className="w-1/3 shrink-0">

        <div className="grid grid-cols-7 border-b border-zinc-100">

          {["日", "月", "火", "水", "木", "金", "土"].map((weekday) => (

            <div key={weekday} className="py-2 text-center text-[10px] font-bold text-zinc-400">

              {weekday}

            </div>

          ))}

        </div>

        <div className="grid grid-cols-7">

          {page.days.map((day, index) => {

            if (day === null) {

              return <div key={`empty-${index}`} className="min-h-[88px] border-b border-zinc-100 bg-zinc-50/30" />;

            }

            const date = `${page.year}.${String(page.month + 1).padStart(2, "0")}.${String(day).padStart(2, "0")}`;

            const dayEvents = page.eventsByDate.get(date) ?? [];

            const uniqueCategories = [...new Set(dayEvents.map((event) => event.category))];

            const isCurrentPage = page.year === year && page.month === month;

            return (

              <button

                key={date}

                type="button"

                onClick={() => {

                  if (isCurrentPage && dayEvents.length > 0 && !isDragging && !isAnimating) {

                    scrollToEvent(dayEvents[0].id);

                  }

                }}

                className={`relative flex min-h-[88px] min-w-0 flex-col items-start justify-start border-b border-zinc-100 px-1 py-1.5 text-left bg-white active:bg-zinc-50`}

              >

                <span className={`mx-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${today === date ? "bg-[#14526B] text-white" : dayEvents.length ? "text-[#14526B]" : "text-zinc-500"}`}>

                  {day}

                </span>

                {uniqueCategories.length > 0 && (

                  <div className="mt-0.5 flex w-full min-w-0 flex-col gap-1">

                    {uniqueCategories.map((category) => (

                      <CategoryLabel
                         key={category}
                         category={category}
                         small
                         label={category === "LIVE"
                           ? `LIVE・${[...new Set(dayEvents.filter((event) => event.category === "LIVE").map((event) => event.city).filter(Boolean))].join("・") || "未設定"}`
                           : category}
                       />

                    ))}

                  </div>

                )}

                {dayEvents.length > 1 && (

                  <p className="mt-1 text-[8px] font-medium text-zinc-500">{dayEvents.length}件</p>

                )}

              </button>

            );

          })}

        </div>

      </div>

    );

  }

  return (

    <main className="min-h-screen bg-white pb-28 text-[#14526B]">

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">

        <h1 className="text-3xl font-bold">SCHEDULE</h1>

        <p className="mt-2 text-sm text-zinc-500"></p>

        <div className="mt-7 flex flex-wrap gap-2 border-b border-zinc-200 pb-5">

          {categories.map((category) => (

            <button

              key={category}

              type="button"

              onClick={() => { setFilter(category); setHighlightedId(null); }}

              className={`rounded-full border px-3 py-2 text-[11px] font-bold transition ${filter === category ? "border-[#14526B] bg-[#14526B] text-white" : "border-zinc-200 bg-white text-[#14526B]"}`}

            >

              {category}

            </button>

          ))}

        </div>

        <div className="mt-7 flex items-center justify-between px-1">

          <button type="button" aria-label="前の月" onClick={() => animateMonth(-1)} disabled={isAnimating || resetting || !canGoPrevious} className="flex h-10 w-10 items-center justify-center rounded-full text-[25px] font-light text-[#14526B] active:bg-zinc-100 disabled:opacity-30">‹</button>

          <div className="flex items-center justify-center gap-1">

            <div className="relative">

              <select aria-label="年を選択" value={year} onChange={(event) => jumpToMonth(Number(event.target.value), month)} className="cursor-pointer appearance-none bg-transparent py-2 pl-2 pr-5 text-[17px] font-bold tracking-tight text-[#14526B] outline-none">

                {availableYears.map((value) => <option key={value} value={value}>{value}年</option>)}

              </select>

              <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[9px]">▼</span>

            </div>

            <div className="relative">

              <select aria-label="月を選択" value={month} onChange={(event) => jumpToMonth(year, Number(event.target.value))} className="cursor-pointer appearance-none bg-transparent py-2 pl-1 pr-5 text-[17px] font-bold tracking-tight text-[#14526B] outline-none">

                {Array.from({ length: 12 }, (_, index) => index)
                  .filter((index) => monthIndex(new Date(year, index, 1)) >= monthIndex(MIN_MONTH) && monthIndex(new Date(year, index, 1)) <= monthIndex(MAX_MONTH))
                  .map((index) => <option key={index} value={index}>{index + 1}月</option>)}

              </select>

              <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[9px]">▼</span>

            </div>

          </div>

          <button type="button" aria-label="次の月" onClick={() => animateMonth(1)} disabled={isAnimating || resetting || !canGoNext} className="flex h-10 w-10 items-center justify-center rounded-full text-[25px] font-light text-[#14526B] active:bg-zinc-100 disabled:opacity-30">›</button>

        </div>

        <div

          ref={containerRef}

          className="mt-2 overflow-hidden touch-pan-y select-none"

          onTouchStart={handleTouchStart}

          onTouchMove={handleTouchMove}

          onTouchEnd={handleTouchEnd}

          onTouchCancel={handleTouchCancel}

        >

          <div

            className={`flex w-[300%] ${isDragging || resetting ? "transition-none" : "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"}`}

            style={{ transform: `translate3d(calc(-33.333333% + ${dragX}px), 0, 0)` }}

            onTransitionEnd={finishAnimation}

          >

            {calendarPages.map(renderCalendarPage)}

          </div>

        </div>

        <section className="mt-7">

          <div className="mb-2 flex items-center justify-between">

            <p className="text-[10px] font-bold tracking-[0.16em] text-zinc-400">{month + 1}月の予定</p>

            <p className="text-[10px] text-zinc-400">{monthEvents.length}件</p>

          </div>

          {monthEvents.length ? (

            <div className="border-y border-zinc-200">

              {monthEvents.map((event) => (

                <div key={event.id} id={`schedule-event-${event.id}`} className={`scroll-mt-24 border-b border-zinc-100 transition-colors duration-500 last:border-b-0 ${highlightedId === event.id ? "bg-[#14526B]/10" : "bg-white"}`}>

                  <div className="py-2">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="text-[10px] font-bold text-[#14526B]">{event.date}</p>

                      <CategoryLabel category={event.category} />

                      {event.time && <span className="text-[10px] font-bold text-zinc-400">{event.time}</span>}

                    </div>

                    {event.href ? (

                      <Link href={event.href} onClick={rememberCalendarMonth} className="mt-1 block">

                        <h3 className="text-[13px] font-bold leading-[1.4] text-[#14526B]">{event.title}</h3>

                        {event.detail && <p className="mt-0.5 text-[12px] leading-snug text-zinc-400">{event.detail}</p>}

                      </Link>

                    ) : (

                      <div className="mt-1">

                        <h3 className="text-[13px] font-bold leading-[1.4] text-[#14526B]">{event.title}</h3>

                        {event.detail && <p className="mt-0.5 text-[12px] leading-snug text-zinc-400">{event.detail}</p>}

                      </div>

                    )}

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="border-t border-zinc-200 py-10 text-center text-[13px] text-zinc-400">この月の予定はありません</div>

          )}

        </section>

      </div>

    </main>

  );

}
