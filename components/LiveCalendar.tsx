"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { lives } from "../data/lives";

type Live = (typeof lives)[number];

type Props = {
  filteredLives?: Live[];
};

type CalendarPage = {
  date: Date;
  year: number;
  month: number;
  days: (number | null)[];
  livesByDate: Record<string, Live[]>;
};

// ========================================
// STORAGE
// ========================================

const CALENDAR_DATE_STORAGE_KEY =
  "liveCalendarDate";

// ========================================
// LIVE CALENDAR
// ========================================

export default function LiveCalendar({
  filteredLives = lives,
}: Props) {
  const [attendedIds, setAttendedIds] =
    useState<string[]>([]);

  const [
    highlightedLiveId,
    setHighlightedLiveId,
  ] = useState<string | null>(null);

  // ========================================
  // 最初に表示する月
  // ========================================

  const [calendarDate, setCalendarDate] =
    useState(() => {
      if (typeof window !== "undefined") {
        const saved =
          sessionStorage.getItem(
            CALENDAR_DATE_STORAGE_KEY
          );

        if (saved) {
          const [year, month] =
            saved.split(".").map(Number);

          if (
            !Number.isNaN(year) &&
            !Number.isNaN(month) &&
            month >= 1 &&
            month <= 12
          ) {
            return new Date(
              year,
              month - 1,
              1
            );
          }
        }
      }

      const latest =
        [...lives].sort((a, b) =>
          b.date.localeCompare(a.date)
        )[0];

      if (!latest) {
        return new Date();
      }

      const [year, month] =
        latest.date
          .split(".")
          .map(Number);

      return new Date(
        year,
        month - 1,
        1
      );
    });

  // ========================================
  // スワイプ
  // ========================================

  const touchStartX =
    useRef<number | null>(null);

  const touchStartY =
    useRef<number | null>(null);

  const [dragX, setDragX] =
    useState(0);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isAnimating, setIsAnimating] =
    useState(false);

  const [containerWidth, setContainerWidth] =
    useState(0);

  const calendarContainerRef =
    useRef<HTMLDivElement | null>(null);

  const SWIPE_THRESHOLD = 55;

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
  // カレンダー横幅
  // ========================================

  useEffect(() => {
    const updateWidth = () => {
      if (
        calendarContainerRef.current
      ) {
        setContainerWidth(
          calendarContainerRef.current
            .clientWidth
        );
      }
    };

    updateWidth();

    window.addEventListener(
      "resize",
      updateWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateWidth
      );
    };
  }, []);

  // ========================================
  // 参戦 ON / OFF
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

    if (
      current.includes(liveId)
    ) {
      updated =
        current.filter(
          (id) =>
            id !== liveId
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
  // 現在年月
  // ========================================

  const calendarYear =
    calendarDate.getFullYear();

  const calendarMonth =
    calendarDate.getMonth();

  // ========================================
  // 年月保存
  // ========================================

  useEffect(() => {
    sessionStorage.setItem(
      CALENDAR_DATE_STORAGE_KEY,
      `${calendarYear}.${String(
        calendarMonth + 1
      ).padStart(2, "0")}`
    );
  }, [
    calendarYear,
    calendarMonth,
  ]);

  // ========================================
  // 表示中の月のライブ
  // ========================================

  const monthLives =
    useMemo(() => {
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
          a.date.localeCompare(
            b.date
          )
        );
    }, [
      filteredLives,
      calendarYear,
      calendarMonth,
    ]);

  // ========================================
  // 指定月のカレンダー情報を作る
  // ========================================

  const createCalendarPage = (
    date: Date
  ): CalendarPage => {
    const year =
      date.getFullYear();

    const month =
      date.getMonth();

    const firstDay =
      new Date(
        year,
        month,
        1
      ).getDay();

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    const days: (
      | number
      | null
    )[] = [];

    for (
      let i = 0;
      i < firstDay;
      i++
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(day);
    }

    while (
  days.length % 7 !== 0
) {
  days.push(null);
}

    const monthLivesForPage =
      filteredLives.filter(
        (live: Live) => {
          const [
            liveYear,
            liveMonth,
          ] =
            live.date
              .split(".")
              .map(Number);

          return (
            liveYear === year &&
            liveMonth === month + 1
          );
        }
      );

    const livesByDate: Record<
      string,
      Live[]
    > = {};

    monthLivesForPage.forEach(
      (live) => {
        if (
          !livesByDate[
            live.date
          ]
        ) {
          livesByDate[
            live.date
          ] = [];
        }

        livesByDate[
          live.date
        ].push(live);
      }
    );

    return {
      date,
      year,
      month,
      days,
      livesByDate,
    };
  };

  // ========================================
  // 前月・現在月・次月
  // ========================================

  const calendarPages =
    useMemo(() => {
      const previous =
        new Date(
          calendarYear,
          calendarMonth - 1,
          1
        );

      const current =
        new Date(
          calendarYear,
          calendarMonth,
          1
        );

      const next =
        new Date(
          calendarYear,
          calendarMonth + 1,
          1
        );

      return [
        createCalendarPage(
          previous
        ),
        createCalendarPage(
          current
        ),
        createCalendarPage(
          next
        ),
      ];
    }, [
      calendarYear,
      calendarMonth,
      filteredLives,
    ]);

  // ========================================
  // 日単位で参戦 ON / OFF
  // ========================================

  const toggleDayAttended = (
    dayLives: Live[]
  ) => {
    if (
      dayLives.length === 0
    ) {
      return;
    }

    if (
      dayLives.length === 1
    ) {
      toggleAttended(
        dayLives[0].id
      );

      return;
    }

    const allAttended =
      dayLives.every(
        (live) =>
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
  // 日付 → 下のライブへスクロール
  // ========================================

  const scrollToLive = (
    liveId: string
  ) => {
    const element =
      document.getElementById(
        `calendar-live-${liveId}`
      );

    if (!element) {
      return;
    }

    setHighlightedLiveId(
      liveId
    );

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.setTimeout(
      () => {
        setHighlightedLiveId(
          null
        );
      },
      1400
    );
  };

  // ========================================
  // 月変更
  // ========================================

  // ========================================
// 月変更完了
// ========================================

const finishMonthChange = (
  direction: "next" | "previous"
) => {
  // ここから位置リセット時の
  // transitionを完全に切る
  setIsDragging(true);
  setIsAnimating(false);

  // 先に3枚の位置を中央へ戻す
  // transition-none なのでアニメーションしない
  setDragX(0);

  // 同じ描画タイミングで月データを更新
  setCalendarDate((current) => {
    return new Date(
      current.getFullYear(),
      current.getMonth() +
        (direction === "next" ? 1 : -1),
      1
    );
  });

  // DOM更新が完了してから
  // 次回用のtransitionを復活
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setIsDragging(false);
    });
  });
};

// ========================================
// 次月へ
// ========================================

const animateToNextMonth = () => {
  if (
    isAnimating ||
    containerWidth === 0
  ) {
    return;
  }

  // 指追従を終了
  // → transitionをON
  setIsDragging(false);
  setIsAnimating(true);

  // 次月が中央まで移動
  setDragX(-containerWidth);

  window.setTimeout(() => {
    finishMonthChange("next");
  }, 300);
};

// ========================================
// 前月へ
// ========================================

const animateToPreviousMonth = () => {
  if (
    isAnimating ||
    containerWidth === 0
  ) {
    return;
  }

  // 指追従を終了
  // → transitionをON
  setIsDragging(false);
  setIsAnimating(true);

  // 前月が中央まで移動
  setDragX(containerWidth);

  window.setTimeout(() => {
    finishMonthChange("previous");
  }, 300);
};

// ========================================
// スワイプキャンセル
// ========================================

const cancelSwipe = () => {
  setIsDragging(false);
  setIsAnimating(true);

  setDragX(0);

  window.setTimeout(() => {
    setIsAnimating(false);
  }, 300);
};

  // ========================================
  // TOUCH START
  // ========================================

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    if (isAnimating) {
      return;
    }

    const touch =
      e.touches[0];

    touchStartX.current =
      touch.clientX;

    touchStartY.current =
      touch.clientY;

    setIsDragging(true);
  };

  // ========================================
  // TOUCH MOVE
  // ========================================

  const handleTouchMove = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    if (
      isAnimating ||
      touchStartX.current ===
        null ||
      touchStartY.current ===
        null
    ) {
      return;
    }

    const touch =
      e.touches[0];

    const diffX =
      touch.clientX -
      touchStartX.current;

    const diffY =
      touch.clientY -
      touchStartY.current;

    // 縦方向の動きが強ければ
    // カレンダーは横移動させない

    if (
      Math.abs(diffY) >
      Math.abs(diffX)
    ) {
      return;
    }

    // 指に追従

    setDragX(diffX);
  };

  // ========================================
  // TOUCH END
  // ========================================

  const handleTouchEnd = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    if (
      touchStartX.current ===
        null ||
      touchStartY.current ===
        null
    ) {
      return;
    }

    const touch =
      e.changedTouches[0];

    const diffX =
      touch.clientX -
      touchStartX.current;

    const diffY =
      touch.clientY -
      touchStartY.current;

    touchStartX.current =
      null;

    touchStartY.current =
      null;

    if (
      Math.abs(diffY) >
      Math.abs(diffX)
    ) {
      cancelSwipe();
      return;
    }

    // 左へ十分スワイプ
    // → 次月

    if (
      diffX <
      -SWIPE_THRESHOLD
    ) {
      animateToNextMonth();
      return;
    }

    // 右へ十分スワイプ
    // → 前月

    if (
      diffX >
      SWIPE_THRESHOLD
    ) {
      animateToPreviousMonth();
      return;
    }

    // 足りなければ元へ

    cancelSwipe();
  };

  // ========================================
  // TOUCH CANCEL
  // ========================================

  const handleTouchCancel =
    () => {
      touchStartX.current =
        null;

      touchStartY.current =
        null;

      cancelSwipe();
    };

  // ========================================
  // カレンダー1枚
  // ========================================

  const renderCalendarPage = (
    page: CalendarPage
  ) => {
    const createDateKey = (
      day: number
    ) => {
      return (
        `${page.year}.` +
        `${String(
          page.month + 1
        ).padStart(
          2,
          "0"
        )}.` +
        `${String(
          day
        ).padStart(
          2,
          "0"
        )}`
      );
    };

    return (
      <div
        key={`${page.year}-${page.month}`}
        className="
          w-1/3
          shrink-0
        "
      >
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
          ].map(
            (weekday) => (
              <div
                key={
                  weekday
                }
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
            )
          )}
        </div>

        {/* ================================= */}
        {/* 日付 */}
        {/* ================================= */}

        <div className="grid grid-cols-7">
          {page.days.map(
            (
              day,
              index
            ) => {
              if (
                day === null
              ) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="
                      min-h-[88px]
                      border-b
                      border-zinc-100
                      bg-zinc-50/30
                    "
                  />
                );
              }

              const dateKey =
                createDateKey(
                  day
                );

              const dayLives =
                page
                  .livesByDate[
                  dateKey
                ] ?? [];

              const hasLive =
                dayLives.length >
                0;

              const cities = [
                ...new Set(
                  dayLives
                    .map(
                      (
                        live
                      ) =>
                        live.city
                    )
                    .filter(
                      Boolean
                    )
                ),
              ];

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

              return (
                <div
                  key={
                    dateKey
                  }
                  onClick={() => {
                    // 現在月以外では
                    // 下のライブへ飛ばさない
                    if (
                      page.year !==
                        calendarYear ||
                      page.month !==
                        calendarMonth
                    ) {
                      return;
                    }

                    if (
                      !hasLive
                    ) {
                      return;
                    }

                    scrollToLive(
                      dayLives[0]
                        .id
                    );
                  }}
                  className={`
                    relative
                    min-h-[88px]
                    border-b
                    border-zinc-100
                    px-1
                    py-1.5
                    transition

                    ${
                      hasLive
                        ? `
                          cursor-pointer
                          bg-[#14526B]/15
                          active:bg-[#14526B]/20
                        `
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

                  {hasLive && (
                    <>
                      {/* 都市 */}

                      <div className="mt-0.5 space-y-0.5 px-0.5">
                        {cities
                          .slice(
                            0,
                            2
                          )
                          .map(
                            (
                              city
                            ) => {
                              const targetLive =
                                dayLives.find(
                                  (
                                    live
                                  ) =>
                                    live.city ===
                                    city
                                );

                              if (
                                !targetLive
                              ) {
                                return null;
                              }

                              return (
                                <button
                                  key={
                                    city
                                  }
                                  type="button"
                                  onClick={(
                                    e
                                  ) => {
                                    e.stopPropagation();

                                    if (
                                      page.year !==
                                        calendarYear ||
                                      page.month !==
                                        calendarMonth
                                    ) {
                                      return;
                                    }

                                    scrollToLive(
                                      targetLive.id
                                    );
                                  }}
                                  className="
                                    block
                                    w-full
                                    truncate
                                    text-left
                                    text-[10px]
                                    font-bold
                                    leading-[1.25]
                                    text-[#14526B]
                                    transition
                                    hover:opacity-70
                                    active:scale-[0.97]
                                    active:opacity-50
                                  "
                                >
                                  {city}
                                </button>
                              );
                            }
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

                      {/* 参戦 */}

                      <button
                        type="button"
                        onClick={(
                          e
                        ) => {
                          e.stopPropagation();

                          toggleDayAttended(
                            dayLives
                          );
                        }}
                        aria-label={
                          allAttended
                            ? `${dateKey}の参戦登録を解除`
                            : `${dateKey}を参戦済みにする`
                        }
                        className={`
                          absolute
                          bottom-1.5
                          right-1.5

                          flex
                          h-8
                          w-8
                          items-center
                          justify-center

                          rounded-full
                          border

                          text-[15px]
                          leading-none

                          shadow-[0_1px_3px_rgba(0,0,0,0.04)]

                          transition-all
                          duration-200

                          hover:scale-105
                          active:scale-90

                          ${
                            allAttended
                              ? `
                                border-[#14526B]
                                bg-[#14526B]
                                text-white
                              `
                              : `
                                border-zinc-200
                                bg-white
                                text-[#14526B]
                              `
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
      </div>
    );
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

        {/* 前月 */}

        <button
          type="button"
          onClick={
            animateToPreviousMonth
          }
          disabled={
            isAnimating
          }
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
            disabled:pointer-events-none
          "
        >
          ‹
        </button>

        {/* ================================= */}
        {/* 年 / 月 */}
        {/* ================================= */}

        <div className="flex items-center justify-center gap-1">

          {/* 年 */}

          <div className="relative">
            <select
              value={
                calendarYear
              }
              onChange={(e) => {
                const newYear =
                  Number(
                    e.target
                      .value
                  );

                setDragX(0);

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
                  lives.map(
                    (live) =>
                      Number(
                        live.date.slice(
                          0,
                          4
                        )
                      )
                  )
                ),
              ]
                .sort(
                  (a, b) =>
                    b - a
                )
                .map(
                  (year) => (
                    <option
                      key={
                        year
                      }
                      value={
                        year
                      }
                    >
                      {year}年
                    </option>
                  )
                )}
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
              value={
                calendarMonth +
                1
              }
              onChange={(e) => {
                const newMonth =
                  Number(
                    e.target
                      .value
                  );

                setDragX(0);

                setCalendarDate(
                  new Date(
                    calendarYear,
                    newMonth -
                      1,
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
                {
                  length: 12,
                },
                (_, index) =>
                  index + 1
              ).map(
                (month) => (
                  <option
                    key={
                      month
                    }
                    value={
                      month
                    }
                  >
                    {month}月
                  </option>
                )
              )}
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

        {/* 次月 */}

        <button
          type="button"
          onClick={
            animateToNextMonth
          }
          disabled={
            isAnimating
          }
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
            disabled:pointer-events-none
          "
        >
          ›
        </button>
      </div>

      {/* ================================= */}
      {/* 3枚カレンダー */}
      {/* ================================= */}

      <div
        ref={
          calendarContainerRef
        }
        className="
          overflow-hidden
          touch-pan-y
          select-none
        "
        onTouchStart={
          handleTouchStart
        }
        onTouchMove={
          handleTouchMove
        }
        onTouchEnd={
          handleTouchEnd
        }
        onTouchCancel={
          handleTouchCancel
        }
      >
        <div
          className={`
            flex
            w-[300%]

            ${
              isDragging
                ? "transition-none"
                : "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            }
          `}
          style={{
            transform:
              containerWidth >
              0
                ? `translate3d(calc(-33.333333% + ${dragX}px), 0, 0)`
                : "translate3d(-33.333333%, 0, 0)",
          }}
        >
          {calendarPages.map(
            (
              page
            ) =>
              renderCalendarPage(
                page
              )
          )}
        </div>
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
            {calendarMonth +
              1}
            月のライブ
          </p>

          <p className="text-[10px] text-zinc-400">
            {
              monthLives.length
            }
            件
          </p>
        </div>

        {monthLives.length >
        0 ? (
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

    const hasSetlist =
      live.setlist.length > 0;

                return (
                  <div
                    key={
                      live.id
                    }
                    id={`calendar-live-${live.id}`}
                    className={`
                      relative
                      scroll-mt-24
                      border-b
                      border-zinc-100
                      last:border-b-0

                      transition-all
                      duration-500

                      ${
                        highlightedLiveId ===
                        live.id
                          ? "bg-[#14526B]/8"
                          : "bg-white"
                      }
                    `}
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
                        {
                          live.date
                        }
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
                        {
                          live.title
                        }
                      </h3>

                      <p
                        className="
                          mt-1
                          text-[12px]
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
                          {
                            live.city
                          }
                        </span>

                        <span className="mx-1.5 text-zinc-300">
                          /
                        </span>

                        {
                          live.venue
                        }
                      </p>
                    </Link>
                    <div className="mt-1.5">
  <span
    className={`
      inline-flex
      items-center
      rounded-full
      px-2
      py-0.5
      text-[9px]
      font-bold
      tracking-[0.04em]

      ${
        hasSetlist
          ? "bg-[#14526B]/10 text-[#14526B]"
          : "bg-zinc-100 text-zinc-400"
      }
    `}
  >
    {hasSetlist
      ? "セトリあり"
      : "セトリなし"}
  </span>
</div>

                    {/* 参戦 */}

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

                        rounded-full
                        border

                        text-[18px]
                        leading-none

                        shadow-[0_1px_3px_rgba(0,0,0,0.04)]

                        transition-all
                        duration-200

                        hover:scale-105
                        active:scale-90

                        ${
                          attended
                            ? `
                              border-[#14526B]
                              bg-[#14526B]
                              text-white
                            `
                            : `
                              border-zinc-200
                              bg-white
                              text-[#14526B]
                            `
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