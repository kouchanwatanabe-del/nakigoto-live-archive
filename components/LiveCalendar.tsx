"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { lives } from "../data/lives";

type Live = (typeof lives)[number];

type Props = {
  filteredLives?: Live[];
};

// ========================================
// LIVE CALENDAR
// ========================================

export default function LiveCalendar({
  filteredLives = lives,
}: Props) {
  const [attendedIds, setAttendedIds] =
    useState<string[]>([]);

  // ========================================
  // 最初に表示する月
  // 最新ライブの月を表示
  // ========================================

  const newestLive = useMemo(() => {
    return [...filteredLives].sort((a, b) =>
      b.date.localeCompare(a.date)
    )[0];
  }, [filteredLives]);

  const [calendarDate, setCalendarDate] =
    useState(() => {
      const latest = [...lives].sort((a, b) =>
        b.date.localeCompare(a.date)
      )[0];

      if (!latest) {
        return new Date();
      }

      const [year, month] = latest.date
        .split(".")
        .map(Number);

      return new Date(
        year,
        month - 1,
        1
      );
    });

  // ========================================
  // 参戦記録読み込み
  // ========================================

  const loadAttendedLives = () => {
    const saved =
      localStorage.getItem(
        "attendedLives"
      );

    if (!saved) {
      setAttendedIds([]);
      return;
    }

    try {
      const parsed =
        JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setAttendedIds(parsed);
      } else {
        setAttendedIds([]);
      }
    } catch {
      setAttendedIds([]);
    }
  };

  useEffect(() => {
    loadAttendedLives();
  }, []);

  // ========================================
  // 他ページから戻ってきた場合も更新
  // ========================================

  useEffect(() => {
    const handleFocus = () => {
      loadAttendedLives();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  // ========================================
  // 参戦ON / OFF
  // ========================================

  const toggleAttended = (
    liveId: string
  ) => {
    const saved =
      localStorage.getItem(
        "attendedLives"
      );

    let current: string[] = [];

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          current = parsed;
        }
      } catch {
        current = [];
      }
    }

    let updated: string[];

    if (current.includes(liveId)) {
      updated = current.filter(
        (id) => id !== liveId
      );
    } else {
      updated = [
        ...current,
        liveId,
      ];
    }

    localStorage.setItem(
      "attendedLives",
      JSON.stringify(updated)
    );

    setAttendedIds(updated);
  };

  // ========================================
  // 現在表示中の年月
  // ========================================

  const calendarYear =
    calendarDate.getFullYear();

  const calendarMonth =
    calendarDate.getMonth();

  // ========================================
  // 表示中の月のライブ
  // ========================================

  const monthLives = useMemo(() => {
    return filteredLives
      .filter((live: Live) => {
        const [year, month] =
          live.date
            .split(".")
            .map(Number);

        return (
          year === calendarYear &&
          month ===
            calendarMonth + 1
        );
      })
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      );
  }, [
    filteredLives,
    calendarYear,
    calendarMonth,
  ]);

  // ========================================
  // 日付ごとにライブをまとめる
  // ========================================

  const livesByDate = useMemo(() => {
    const result: Record<
      string,
      Live[]
    > = {};

    monthLives.forEach(
      (live: Live) => {
        if (!result[live.date]) {
          result[live.date] = [];
        }

        result[live.date].push(
          live
        );
      }
    );

    return result;
  }, [monthLives]);

  // ========================================
  // カレンダーの日付を作成
  // ========================================

  const calendarDays =
    useMemo(() => {
      const firstDay =
        new Date(
          calendarYear,
          calendarMonth,
          1
        ).getDay();

      const daysInMonth =
        new Date(
          calendarYear,
          calendarMonth + 1,
          0
        ).getDate();

      const days: (
        | number
        | null
      )[] = [];

      // 月初までの空白
      for (
        let i = 0;
        i < firstDay;
        i++
      ) {
        days.push(null);
      }

      // 日付
      for (
        let day = 1;
        day <= daysInMonth;
        day++
      ) {
        days.push(day);
      }

      // 最後の週を7列に揃える
      while (
        days.length % 7 !== 0
      ) {
        days.push(null);
      }

      return days;
    }, [
      calendarYear,
      calendarMonth,
    ]);

  // ========================================
  // YYYY.MM.DD生成
  // ========================================

  const createDateKey = (
    day: number
  ) => {
    return (
      `${calendarYear}.` +
      `${String(
        calendarMonth + 1
      ).padStart(2, "0")}.` +
      `${String(day).padStart(
        2,
        "0"
      )}`
    );
  };

  // ========================================
  // 前月
  // ========================================

  const previousMonth = () => {
    setCalendarDate(
      new Date(
        calendarYear,
        calendarMonth - 1,
        1
      )
    );
  };

  // ========================================
  // 翌月
  // ========================================

  const nextMonth = () => {
    setCalendarDate(
      new Date(
        calendarYear,
        calendarMonth + 1,
        1
      )
    );
  };

  // ========================================
  // 日単位で参戦ON/OFF
  // ========================================

  const toggleDayAttended = (
    dayLives: Live[]
  ) => {
    if (dayLives.length === 0) {
      return;
    }

    // 1公演なら普通に切り替え
    if (dayLives.length === 1) {
      toggleAttended(
        dayLives[0].id
      );

      return;
    }

    // 同日複数公演
    const allAttended =
      dayLives.every((live) =>
        attendedIds.includes(
          live.id
        )
      );

    let updated = [
      ...attendedIds,
    ];

    if (allAttended) {
      const ids =
        new Set(
          dayLives.map(
            (live) =>
              live.id
          )
        );

      updated =
        updated.filter(
          (id) =>
            !ids.has(id)
        );
    } else {
      dayLives.forEach(
        (live) => {
          if (
            !updated.includes(
              live.id
            )
          ) {
            updated.push(
              live.id
            );
          }
        }
      );
    }

    localStorage.setItem(
      "attendedLives",
      JSON.stringify(updated)
    );

    setAttendedIds(updated);
  };

  // ========================================
  // JSX
  // ========================================

  return (
    <section className="mt-4">

      {/* ================================= */}
      {/* 月切り替え */}
      {/* ================================= */}

      <div className="flex items-center justify-between px-1">

  {/* 前の月 */}

  <button
    type="button"
    onClick={previousMonth}
    aria-label="前の月"
    className="
      flex
      h-10
      w-10
      items-center
      justify-center
      rounded-full
      text-[25px]
      font-light
      text-[#14526B]
      transition
      active:bg-zinc-100
    "
  >
    ‹
  </button>


  {/* ================================= */}
  {/* 年 / 月 選択 */}
  {/* ================================= */}

  <div className="flex items-center justify-center gap-1">

    {/* 年 */}

    <div className="relative">
      <select
        value={calendarYear}
        onChange={(e) => {
          const newYear =
            Number(e.target.value);

          setCalendarDate(
            new Date(
              newYear,
              calendarMonth,
              1
            )
          );
        }}
        className="
          cursor-pointer
          appearance-none
          bg-transparent
          py-2
          pl-2
          pr-5

          text-[17px]
          font-bold
          tracking-tight
          text-[#14526B]

          outline-none
        "
      >
        {[
          ...new Set(
            lives.map((live) =>
              Number(
                live.date.slice(0, 4)
              )
            )
          ),
        ]
          .sort((a, b) => b - a)
          .map((year) => (
            <option
              key={year}
              value={year}
            >
              {year}年
            </option>
          ))}
      </select>

      <span
        className="
          pointer-events-none
          absolute
          right-0
          top-1/2
          -translate-y-1/2
          text-[9px]
          text-[#14526B]
        "
      >
        ▼
      </span>
    </div>


    {/* 月 */}

    <div className="relative">
      <select
        value={calendarMonth + 1}
        onChange={(e) => {
          const newMonth =
            Number(e.target.value);

          setCalendarDate(
            new Date(
              calendarYear,
              newMonth - 1,
              1
            )
          );
        }}
        className="
          cursor-pointer
          appearance-none
          bg-transparent
          py-2
          pl-1
          pr-5

          text-[17px]
          font-bold
          tracking-tight
          text-[#14526B]

          outline-none
        "
      >
        {Array.from(
          { length: 12 },
          (_, index) =>
            index + 1
        ).map((month) => (
          <option
            key={month}
            value={month}
          >
            {month}月
          </option>
        ))}
      </select>

      <span
        className="
          pointer-events-none
          absolute
          right-0
          top-1/2
          -translate-y-1/2
          text-[9px]
          text-[#14526B]
        "
      >
        ▼
      </span>
    </div>

  </div>


  {/* 次の月 */}

  <button
    type="button"
    onClick={nextMonth}
    aria-label="次の月"
    className="
      flex
      h-10
      w-10
      items-center
      justify-center
      rounded-full
      text-[25px]
      font-light
      text-[#14526B]
      transition
      active:bg-zinc-100
    "
  >
    ›
  </button>

</div>

      {/* ================================= */}
      {/* 曜日 */}
      {/* ================================= */}

      <div
        className="
          mt-2
          grid
          grid-cols-7
          border-b
          border-zinc-100
        "
      >
        {[
          "日",
          "月",
          "火",
          "水",
          "木",
          "金",
          "土",
        ].map((weekday) => (
          <div
            key={weekday}
            className="
              py-2
              text-center
              text-[10px]
              font-bold
              text-zinc-400
            "
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* ================================= */}
      {/* カレンダー */}
      {/* ================================= */}

      <div className="grid grid-cols-7">

        {calendarDays.map(
          (day, index) => {

            // 空白
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="
                    min-h-[92px]
                    border-b
                    border-zinc-100
                    bg-zinc-50/30
                  "
                />
              );
            }

            const dateKey =
              createDateKey(day);

            const dayLives =
              livesByDate[
                dateKey
              ] ?? [];

            const hasLive =
              dayLives.length > 0;

            // =================================
            // 都市名
            // =================================

            const cities = [
              ...new Set(
                dayLives
                  .map(
                    (live) =>
                      live.city
                  )
                  .filter(Boolean)
              ),
            ];

            // =================================
            // 参戦状態
            // =================================

            const attendedCount =
              dayLives.filter(
                (live) =>
                  attendedIds.includes(
                    live.id
                  )
              ).length;

            const allAttended =
              hasLive &&
              attendedCount ===
                dayLives.length;

            const someAttended =
              attendedCount > 0 &&
              !allAttended;

            return (
              <div
                key={dateKey}
                className={`
                  relative
                  min-h-[92px]
                  border-b
                  border-zinc-100
                  px-1
                  py-1.5

                  ${
                    hasLive
                      ? "bg-[#14526B]/[0.025]"
                      : "bg-white"
                  }
                `}
              >

                {/* 日付 */}

                <div
                  className={`
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    text-[11px]
                    font-semibold

                    ${
                      hasLive
                        ? "text-[#14526B]"
                        : "text-zinc-500"
                    }
                  `}
                >
                  {day}
                </div>

                {/* ================================= */}
                {/* ライブあり */}
                {/* ================================= */}

                {hasLive && (
                  <>

                    {/* 都市 */}

                    <div className="mt-0.5 space-y-0.5 px-0.5">

                      {cities
                        .slice(0, 2)
                        .map(
                          (city) => (
                            <p
                              key={
                                city
                              }
                              className="
                                truncate
                                text-[9px]
                                font-bold
                                leading-[1.25]
                                text-[#14526B]
                              "
                            >
                              {city}
                            </p>
                          )
                        )}

                    </div>

                    {/* 同日複数公演 */}

                    {dayLives.length >
                      1 && (
                      <p
                        className="
                          mt-1
                          px-0.5
                          text-[8px]
                          font-medium
                          leading-none
                          text-zinc-400
                        "
                      >
                        {
                          dayLives.length
                        }{" "}
                        LIVES
                      </p>
                    )}

                    {/* ================================= */}
                    {/* 参戦ボタン */}
                    {/* ================================= */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleDayAttended(
                          dayLives
                        )
                      }
                      aria-label={
                        allAttended
                          ? `${dateKey}の参戦登録を解除`
                          : `${dateKey}を参戦済みにする`
                      }
                      className={`
                        absolute
                        bottom-1
                        right-1

                        flex
                        h-7
                        w-7
                        items-center
                        justify-center

                        rounded-full

                        text-[17px]
                        leading-none

                        transition
                        active:scale-90

                        ${
                          allAttended
                            ? "text-[#14526B]"
                            : someAttended
                              ? "text-[#14526B]/50"
                              : "text-zinc-300"
                        }
                      `}
                    >
                      {allAttended
                        ? "♥"
                        : "♡"}
                    </button>

                  </>
                )}

              </div>
            );
          }
        )}

      </div>

      {/* ================================= */}
      {/* この月のライブ */}
      {/* ================================= */}

      <div className="mt-7">

        <div
          className="
            mb-2
            flex
            items-center
            justify-between
          "
        >

          <p
            className="
              text-[10px]
              font-bold
              tracking-[0.16em]
              text-zinc-400
            "
          >
            {calendarMonth + 1}月のライブ
          </p>

          <p className="text-[10px] text-zinc-400">
            {monthLives.length}件
          </p>

        </div>

        {/* ================================= */}
        {/* ライブあり */}
        {/* ================================= */}

        {monthLives.length > 0 ? (

          <div
            className="
              border-y
              border-zinc-200
            "
          >

            {monthLives.map(
              (live: Live) => {

                const attended =
                  attendedIds.includes(
                    live.id
                  );

                return (
                  <div
                    key={live.id}
                    className="
                      relative
                      border-b
                      border-zinc-100
                      last:border-b-0
                    "
                  >

                    {/* ライブ詳細 */}

                    <Link
                      href={`/live/${live.id}`}
                      className="
                        block
                        py-2.5
                        pr-12
                      "
                    >

                      <p
                        className="
                          text-[10px]
                          font-bold
                          text-[#14526B]
                        "
                      >
                        {live.date}
                      </p>

                      <h3
                        className="
                          mt-0.5
                          text-[13px]
                          font-bold
                          leading-[1.35]
                          text-[#14526B]
                        "
                      >
                        {live.title}
                      </h3>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          leading-snug
                          text-zinc-400
                        "
                      >

                        <span
                          className="
                            font-semibold
                            text-[#14526B]
                          "
                        >
                          {live.city}
                        </span>

                        <span className="mx-1.5 text-zinc-300">
                          /
                        </span>

                        {live.venue}

                      </p>

                    </Link>

                    {/* ================================= */}
                    {/* 参戦ボタン */}
                    {/* ================================= */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleAttended(
                          live.id
                        )
                      }
                      aria-label={
                        attended
                          ? "参戦済みを解除"
                          : "参戦済みにする"
                      }
                      className={`
                        absolute
                        right-1
                        top-1/2

                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center

                        text-[18px]

                        transition
                        active:scale-90

                        ${
                          attended
                            ? "text-[#14526B]"
                            : "text-zinc-300"
                        }
                      `}
                    >
                      {attended
                        ? "♥"
                        : "♡"}
                    </button>

                  </div>
                );
              }
            )}

          </div>

        ) : (

          // =================================
          // ライブなし
          // =================================

          <div className="py-10 text-center">

            <p className="text-[13px] text-zinc-400">
              この月のライブはありません
            </p>

          </div>

        )}

      </div>

    </section>
  );
}