"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { lives } from "../../data/lives";
import LiveList from "../../components/LiveList";
import LiveCalendar from "../../components/LiveCalendar";

type Live = (typeof lives)[number];

type SetlistFilter =
  | "すべて"
  | "あり"
  | "なし";

type ViewMode =
  | "list"
  | "calendar";

const FILTER_STORAGE_KEY =
  "liveSearchFilters";

const SCROLL_STORAGE_KEY =
  "liveSearchScrollPosition";

const RESTORE_STORAGE_KEY =
  "liveShouldRestoreScroll";

const VIEW_STORAGE_KEY =
  "liveViewMode";

export default function LivesPage() {
  // ========================================
  // LIST用 検索・フィルター
  // ========================================

  const [keyword, setKeyword] =
    useState("");

  const [year, setYear] =
    useState("すべて");

  const [month, setMonth] =
    useState("すべて");

  const [
    setlistFilter,
    setSetlistFilter,
  ] = useState<SetlistFilter>(
    "すべて"
  );

  const [
    attendedOnly,
    setAttendedOnly,
  ] = useState(false);

  const [
    attendedIds,
    setAttendedIds,
  ] = useState<string[]>([]);

  // ========================================
  // LIST / CALENDAR
  // ========================================

  const [
    viewMode,
    setViewMode,
  ] = useState<ViewMode>("list");

  const [
    filtersLoaded,
    setFiltersLoaded,
  ] = useState(false);

  const [
    scrollRestored,
    setScrollRestored,
  ] = useState(false);

  // ========================================
  // 参戦記録
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

      if (
        Array.isArray(parsed)
      ) {
        setAttendedIds(
          parsed
        );
      } else {
        setAttendedIds([]);
      }
    } catch {
      setAttendedIds([]);
    }
  };

  // ========================================
  // 初回読み込み
  // ========================================

  useEffect(() => {
    loadAttendedLives();

    // LIST / CALENDAR復元

    const savedView =
      sessionStorage.getItem(
        VIEW_STORAGE_KEY
      );

    if (
      savedView === "list" ||
      savedView === "calendar"
    ) {
      setViewMode(savedView);
    }

    // LIST検索条件復元

    const savedFilters =
      sessionStorage.getItem(
        FILTER_STORAGE_KEY
      );

    if (savedFilters) {
      try {
        const parsed =
          JSON.parse(
            savedFilters
          );

        if (
          typeof parsed.keyword ===
          "string"
        ) {
          setKeyword(
            parsed.keyword
          );
        }

        if (
          typeof parsed.year ===
          "string"
        ) {
          setYear(
            parsed.year
          );
        }

        if (
          typeof parsed.month ===
          "string"
        ) {
          setMonth(
            parsed.month
          );
        }

        if (
          parsed.setlistFilter ===
            "すべて" ||
          parsed.setlistFilter ===
            "あり" ||
          parsed.setlistFilter ===
            "なし"
        ) {
          setSetlistFilter(
            parsed.setlistFilter
          );
        }

        if (
          typeof parsed.attendedOnly ===
          "boolean"
        ) {
          setAttendedOnly(
            parsed.attendedOnly
          );
        }
      } catch {
        sessionStorage.removeItem(
          FILTER_STORAGE_KEY
        );
      }
    }

    setFiltersLoaded(true);
  }, []);

  // ========================================
  // ページに戻ったとき
  // 参戦記録更新
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
  // LIST / CALENDAR状態保存
  // ========================================

  useEffect(() => {
    if (!filtersLoaded) {
      return;
    }

    sessionStorage.setItem(
      VIEW_STORAGE_KEY,
      viewMode
    );
  }, [
    viewMode,
    filtersLoaded,
  ]);

  // ========================================
  // LIST検索条件保存
  // ========================================

  useEffect(() => {
    if (!filtersLoaded) {
      return;
    }

    const filters = {
      keyword,
      year,
      month,
      setlistFilter,
      attendedOnly,
    };

    sessionStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify(filters)
    );
  }, [
    keyword,
    year,
    month,
    setlistFilter,
    attendedOnly,
    filtersLoaded,
  ]);

  // ========================================
  // 開催年
  // ========================================

  const years =
    useMemo(() => {
      const yearList =
        lives.map(
          (live: Live) =>
            live.date.slice(
              0,
              4
            )
        );

      return [
        ...new Set(yearList),
      ].sort(
        (a, b) =>
          b.localeCompare(a)
      );
    }, []);

  // ========================================
  // 月
  // ========================================

  const months =
    useMemo(() => {
      if (
        year === "すべて"
      ) {
        return [];
      }

      const monthList =
        lives
          .filter(
            (live: Live) =>
              live.date.startsWith(
                `${year}.`
              )
          )
          .map(
            (live: Live) =>
              live.date.slice(
                5,
                7
              )
          );

      return [
        ...new Set(monthList),
      ].sort(
        (a, b) =>
          Number(a) -
          Number(b)
      );
    }, [year]);

  // ========================================
  // LIST用検索
  // ========================================

  const filteredLives =
    useMemo(() => {
      const q =
        keyword
          .trim()
          .toLowerCase();

      return lives
        .filter(
          (live: Live) => {
            // 年

            const yearMatch =
              year ===
                "すべて" ||
              live.date.startsWith(
                year
              );

            // 月

            const monthMatch =
              year ===
                "すべて" ||
              month ===
                "すべて" ||
              live.date.startsWith(
                `${year}.${month}`
              );

            // セトリ

            const hasSetlist =
              live.setlist.length >
              0;

            const setlistMatch =
              setlistFilter ===
                "すべて" ||
              (setlistFilter ===
                "あり" &&
                hasSetlist) ||
              (setlistFilter ===
                "なし" &&
                !hasSetlist);

            // 参戦済み

            const attendedMatch =
              !attendedOnly ||
              attendedIds.includes(
                live.id
              );

            // 公演名

            const titleMatch =
              live.title
                .toLowerCase()
                .includes(q);

            // 都市

            const cityMatch =
              live.city
                .toLowerCase()
                .includes(q);

            // 会場

            const venueMatch =
              live.venue
                .toLowerCase()
                .includes(q);

            // ツアー

            const tourMatch =
              live.tour
                ?.toLowerCase()
                .includes(q) ??
              false;

            // 曲名

            const songMatch =
              live.setlist.some(
                (song: string) =>
                  song
                    .toLowerCase()
                    .includes(q)
              );

            // アンコール

            const encoreMatch =
              "encore" in live &&
              Array.isArray(
                live.encore
              ) &&
              live.encore.some(
                (song: string) =>
                  song
                    .toLowerCase()
                    .includes(q)
              );

            // 対バン

            const artistMatch =
              "artists" in live &&
              Array.isArray(
                live.artists
              ) &&
              live.artists.some(
                (
                  artist: string
                ) =>
                  artist
                    .toLowerCase()
                    .includes(q)
              );

            const keywordMatch =
              q === "" ||
              titleMatch ||
              cityMatch ||
              venueMatch ||
              tourMatch ||
              songMatch ||
              encoreMatch ||
              artistMatch;

            return (
              yearMatch &&
              monthMatch &&
              setlistMatch &&
              attendedMatch &&
              keywordMatch
            );
          }
        )
        .sort(
          (a, b) =>
            b.date.localeCompare(
              a.date
            )
        );
    }, [
      keyword,
      year,
      month,
      setlistFilter,
      attendedOnly,
      attendedIds,
    ]);

  // ========================================
  // スクロール復元
  // ========================================

  useEffect(() => {
    if (!filtersLoaded) {
      return;
    }

    if (scrollRestored) {
      return;
    }

    const shouldRestore =
      sessionStorage.getItem(
        RESTORE_STORAGE_KEY
      );

    if (
      shouldRestore !== "true"
    ) {
      sessionStorage.removeItem(
        SCROLL_STORAGE_KEY
      );

      setScrollRestored(true);

      return;
    }

    const savedScroll =
      sessionStorage.getItem(
        SCROLL_STORAGE_KEY
      );

    sessionStorage.removeItem(
      RESTORE_STORAGE_KEY
    );

    if (!savedScroll) {
      setScrollRestored(true);

      return;
    }

    const scrollPosition =
      Number(savedScroll);

    if (
      Number.isNaN(
        scrollPosition
      )
    ) {
      sessionStorage.removeItem(
        SCROLL_STORAGE_KEY
      );

      setScrollRestored(true);

      return;
    }

    const frame =
      requestAnimationFrame(
        () => {
          window.scrollTo({
            top:
              scrollPosition,
            behavior:
              "instant",
          });

          requestAnimationFrame(
            () => {
              setScrollRestored(
                true
              );
            }
          );
        }
      );

    return () => {
      cancelAnimationFrame(
        frame
      );
    };
  }, [
    filtersLoaded,
    scrollRestored,
    filteredLives.length,
  ]);

  // ========================================
  // LIST検索条件リセット
  // ========================================

  const resetFilters = () => {
    setKeyword("");

    setYear("すべて");

    setMonth("すべて");

    setSetlistFilter(
      "すべて"
    );

    setAttendedOnly(false);

    sessionStorage.removeItem(
      FILTER_STORAGE_KEY
    );

    sessionStorage.removeItem(
      SCROLL_STORAGE_KEY
    );

    sessionStorage.removeItem(
      RESTORE_STORAGE_KEY
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // JSX
  // ========================================

  return (
    <main
      className={`min-h-screen bg-white pb-36 text-zinc-900 ${
        filtersLoaded &&
        scrollRestored
          ? "visible"
          : "invisible"
      }`}
    >
      <div
        className="
          mx-auto
          w-full
          max-w-3xl
          px-4
          py-8
          sm:px-6
          sm:py-10
        "
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div>
          <h1
            className="
              text-3xl
              font-bold
              text-[#14526B]
            "
          >
            LIVE
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-zinc-500
              sm:text-base
            "
          >
            ライブ・セットリスト一覧
          </p>
        </div>

        {/* ================================= */}
        {/* LIST / CALENDAR */}
        {/* ================================= */}

        <div
          className="
            mt-6
            flex
            border-b
            border-zinc-200
          "
        >
          {/* LIST */}

          <button
  type="button"
  onClick={() => {
    loadAttendedLives();

    setViewMode(
      "list"
    );
  }}
  className={`
    relative
    px-4
    pb-2.5
    text-[12px]
    font-bold
    tracking-[0.08em]
    transition

    ${
      viewMode === "list"
        ? "text-[#14526B]"
        : "text-zinc-400"
    }
  `}
>
  LIST

  {viewMode === "list" && (
    <span
      className="
        absolute
        bottom-[-1px]
        left-0
        h-[2px]
        w-full
        bg-[#14526B]
      "
    />
  )}
</button>

          {/* CALENDAR */}

          <button
            type="button"
            onClick={() => {
              loadAttendedLives();

              setViewMode(
                "calendar"
              );
            }}
            className={`
              relative
              px-6
              pb-2.5
              text-[12px]
              font-bold
              tracking-[0.08em]
              transition

              ${
                viewMode ===
                "calendar"
                  ? "text-[#14526B]"
                  : "text-zinc-400"
              }
            `}
          >
            CALENDAR

            {viewMode ===
              "calendar" && (
              <span
                className="
                  absolute
                  bottom-[-1px]
                  left-0
                  h-[2px]
                  w-full
                  bg-[#14526B]
                "
              />
            )}
          </button>
        </div>

        {/* ================================= */}
        {/* LISTのときだけ検索条件を表示 */}
        {/* ================================= */}

        {viewMode === "list" && (
          <>
            <section className="mt-6">

              {/* ================================= */}
              {/* 検索 */}
              {/* ================================= */}

              <div className="relative z-10">
                <input
                  type="search"
                  value={keyword}
                  onChange={(e) =>
                    setKeyword(
                      e.target.value
                    )
                  }
                  placeholder="曲名・都道府県・会場・公演名・対バン相手を検索"
                  autoComplete="off"
                  enterKeyHint="search"
                  className="
                    relative
                    z-10
                    w-full
                    appearance-none
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-white
                    px-4
                    py-4
                    pr-12
                    text-[12px]
                    text-zinc-900
                    shadow-sm
                    outline-none
                    transition
                    placeholder:text-zinc-400
                    focus:border-[#14526B]
                    focus:ring-2
                    focus:ring-[#14526B]/10
                  "
                />

                {keyword && (
                  <button
                    type="button"
                    onClick={() =>
                      setKeyword("")
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      z-20
                      flex
                      h-10
                      w-10
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      text-xl
                      text-zinc-400
                      active:bg-zinc-100
                    "
                    aria-label="検索文字を消去"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* ================================= */}
              {/* 年 */}
              {/* ================================= */}

              <div
                className="
                  mt-3
                  flex
                  gap-2
                  overflow-x-auto
                  pb-1
                "
              >
                <button
                  type="button"
                  onClick={() => {
                    setYear(
                      "すべて"
                    );

                    setMonth(
                      "すべて"
                    );
                  }}
                  className={`
                    shrink-0
                    rounded-full
                    border
                    px-4
                    py-2
                    text-[12px]
                    font-medium
                    transition

                    ${
                      year ===
                      "すべて"
                        ? "border-[#14526B] bg-[#14526B] text-white"
                        : "border-zinc-200 bg-white text-zinc-600"
                    }
                  `}
                >
                  すべて
                </button>

                {years.map(
                  (y: string) => (
                    <button
                      type="button"
                      key={y}
                      onClick={() => {
                        setYear(y);

                        setMonth(
                          "すべて"
                        );
                      }}
                      className={`
                        shrink-0
                        rounded-full
                        border
                        px-4
                        py-2
                        text-[12px]
                        font-medium
                        transition

                        ${
                          year === y
                            ? "border-[#14526B] bg-[#14526B] text-white"
                            : "border-zinc-200 bg-white text-zinc-600"
                        }
                      `}
                    >
                      {y}
                    </button>
                  )
                )}
              </div>

              {/* ================================= */}
              {/* 月 */}
              {/* ================================= */}

              {year !==
                "すべて" && (
                <div
                  className="
                    mt-2
                    flex
                    gap-2
                    overflow-x-auto
                    pb-1
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setMonth(
                        "すべて"
                      )
                    }
                    className={`
                      shrink-0
                      rounded-full
                      border
                      px-3.5
                      py-1.5
                      text-[11px]
                      font-medium
                      transition

                      ${
                        month ===
                        "すべて"
                          ? "border-[#14526B] bg-[#14526B] text-white"
                          : "border-zinc-200 bg-white text-zinc-600"
                      }
                    `}
                  >
                    すべて
                  </button>

                  {months.map(
                    (m: string) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() =>
                          setMonth(m)
                        }
                        className={`
                          shrink-0
                          rounded-full
                          border
                          px-3.5
                          py-1.5
                          text-[11px]
                          font-medium
                          transition

                          ${
                            month === m
                              ? "border-[#14526B] bg-[#14526B] text-white"
                              : "border-zinc-200 bg-white text-zinc-600"
                          }
                        `}
                      >
                        {Number(m)}月
                      </button>
                    )
                  )}
                </div>
              )}

              {/* ================================= */}
              {/* セトリ / 参戦 */}
              {/* ================================= */}

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setSetlistFilter(
                      setlistFilter ===
                        "あり"
                        ? "すべて"
                        : "あり"
                    )
                  }
                  className={`
                    rounded-full
                    border
                    px-4
                    py-2
                    text-[12px]
                    font-semibold
                    transition

                    ${
                      setlistFilter ===
                      "あり"
                        ? "border-[#14526B] bg-[#14526B] text-white"
                        : "border-zinc-200 bg-white text-[#14526B]"
                    }
                  `}
                >
                  セトリあり
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSetlistFilter(
                      setlistFilter ===
                        "なし"
                        ? "すべて"
                        : "なし"
                    )
                  }
                  className={`
                    rounded-full
                    border
                    px-4
                    py-2
                    text-[12px]
                    font-semibold
                    transition

                    ${
                      setlistFilter ===
                      "なし"
                        ? "border-[#14526B] bg-[#14526B] text-white"
                        : "border-zinc-200 bg-white text-[#14526B]"
                    }
                  `}
                >
                  セトリなし
                </button>

                <button
                  type="button"
                  onClick={() => {
                    loadAttendedLives();

                    setAttendedOnly(
                      !attendedOnly
                    );
                  }}
                  className={`
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-4
                    py-2
                    text-[12px]
                    font-semibold
                    transition

                    ${
                      attendedOnly
                        ? "border-[#14526B] bg-[#14526B] text-white"
                        : "border-zinc-200 bg-white text-[#14526B]"
                    }
                  `}
                >
                  <span
                    className="
                      text-[14px]
                      leading-none
                    "
                  >
                    {attendedOnly
                      ? "♥"
                      : "♡"}
                  </span>

                  参戦済み
                </button>
              </div>
            </section>

            {/* ================================= */}
            {/* LIST 件数 / リセット */}
            {/* ================================= */}

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <p
                className="
                  shrink-0
                  text-sm
                  text-zinc-500
                "
              >
                {filteredLives.length}
                件
              </p>

              {(keyword ||
                year !==
                  "すべて" ||
                month !==
                  "すべて" ||
                setlistFilter !==
                  "すべて" ||
                attendedOnly) && (
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="
                    text-sm
                    font-medium
                    text-[#14526B]
                  "
                >
                  条件をリセット
                </button>
              )}
            </div>
          </>
        )}

        {/* ================================= */}
        {/* LIST */}
        {/* ================================= */}

        {viewMode === "list" && (
          <LiveList
            filteredLives={
              filteredLives
            }
            attendedOnly={
              attendedOnly
            }
            onResetFilters={
              resetFilters
            }
          />
        )}

        {/* ================================= */}
        {/* CALENDAR */}
        {/* LISTの検索条件を一切使わない */}
        {/* ================================= */}

        {viewMode ===
          "calendar" && (
          <div className="mt-5">
            <LiveCalendar
              filteredLives={
                lives
              }
            />
          </div>
        )}
      </div>
    </main>
  );
}