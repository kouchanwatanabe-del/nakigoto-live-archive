"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lives } from "../../data/lives";
import AttendedIconButton from "../../components/AttendedIconButton";

type Live = (typeof lives)[number];
type SetlistFilter = "すべて" | "あり" | "なし";

const FILTER_STORAGE_KEY = "liveSearchFilters";
const SCROLL_STORAGE_KEY = "liveSearchScrollPosition";
const RESTORE_STORAGE_KEY = "liveShouldRestoreScroll";

export default function LivesPage() {
  const [keyword, setKeyword] = useState("");
  const [year, setYear] = useState("すべて");
  const [month, setMonth] = useState("すべて");

  const [setlistFilter, setSetlistFilter] =
    useState<SetlistFilter>("すべて");

  const [attendedOnly, setAttendedOnly] = useState(false);
  const [attendedIds, setAttendedIds] = useState<string[]>([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [scrollRestored, setScrollRestored] = useState(false);

  // ========================================
  // 参戦記録を読み込む
  // ========================================

  const loadAttendedLives = () => {
    const saved = localStorage.getItem("attendedLives");

    if (!saved) {
      setAttendedIds([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setAttendedIds(parsed);
      } else {
        setAttendedIds([]);
      }
    } catch {
      setAttendedIds([]);
    }
  };

  // ========================================
  // 最初に検索条件を復元
  // ========================================

  useEffect(() => {
    loadAttendedLives();

    const savedFilters =
      sessionStorage.getItem(FILTER_STORAGE_KEY);

    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);

        if (typeof parsed.keyword === "string") {
          setKeyword(parsed.keyword);
        }

        if (typeof parsed.year === "string") {
          setYear(parsed.year);
        }

        if (typeof parsed.month === "string") {
          setMonth(parsed.month);
        }

        if (
          parsed.setlistFilter === "すべて" ||
          parsed.setlistFilter === "あり" ||
          parsed.setlistFilter === "なし"
        ) {
          setSetlistFilter(parsed.setlistFilter);
        }

        if (typeof parsed.attendedOnly === "boolean") {
          setAttendedOnly(parsed.attendedOnly);
        }
      } catch {
        sessionStorage.removeItem(FILTER_STORAGE_KEY);
      }
    }

    setFiltersLoaded(true);
  }, []);

  // ========================================
  // 検索条件が変わるたびに保存
  // ========================================

  useEffect(() => {
    if (!filtersLoaded) return;

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
  // 登録されている開催年を自動取得
  // ========================================

  const years = useMemo(() => {
    const yearList = lives.map((live: Live) =>
      live.date.slice(0, 4)
    );

    return [...new Set(yearList)].sort((a, b) =>
      b.localeCompare(a)
    );
  }, []);

  // ========================================
  // 選択した年に存在する月を自動取得
  // ========================================

  const months = useMemo(() => {
    if (year === "すべて") {
      return [];
    }

    const monthList = lives
      .filter((live: Live) =>
        live.date.startsWith(`${year}.`)
      )
      .map((live: Live) =>
        live.date.slice(5, 7)
      );

    return [...new Set(monthList)].sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [year]);

  // ========================================
  // 検索・絞り込み
  // ========================================

  const filteredLives = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return lives
      .filter((live: Live) => {
        // 年
        const yearMatch =
          year === "すべて" ||
          live.date.startsWith(year);

        // 月
        const monthMatch =
          year === "すべて" ||
          month === "すべて" ||
          live.date.startsWith(
            `${year}.${month}`
          );

        // セトリ掲載状況
        const hasSetlist =
          live.setlist.length > 0;

        const setlistFilterMatch =
          setlistFilter === "すべて" ||
          (setlistFilter === "あり" &&
            hasSetlist) ||
          (setlistFilter === "なし" &&
            !hasSetlist);

        // 参戦済み
        const attendedMatch =
          !attendedOnly ||
          attendedIds.includes(live.id);

        // 公演名
        const titleMatch =
          live.title.toLowerCase().includes(q);

        // 都市
        const cityMatch =
          live.city.toLowerCase().includes(q);

        // 会場
        const venueMatch =
          live.venue.toLowerCase().includes(q);

        // ツアー
        const tourMatch =
          live.tour.toLowerCase().includes(q);

        // セットリスト
        const setlistMatch =
          live.setlist.some((song: string) =>
            song.toLowerCase().includes(q)
          );

        // アンコール
        const encoreMatch =
          "encore" in live &&
          Array.isArray(live.encore) &&
          live.encore.some((song: string) =>
            song.toLowerCase().includes(q)
          );

        const keywordMatch =
          q === "" ||
          titleMatch ||
          cityMatch ||
          venueMatch ||
          tourMatch ||
          setlistMatch ||
          encoreMatch;

        return (
          yearMatch &&
          monthMatch &&
          setlistFilterMatch &&
          attendedMatch &&
          keywordMatch
        );
      })
      .sort((a, b) =>
        b.date.localeCompare(a.date)
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
  // スクロール位置を復元
  // ========================================

  useEffect(() => {
    if (!filtersLoaded) return;
    if (scrollRestored) return;

    const shouldRestore =
      sessionStorage.getItem(
        RESTORE_STORAGE_KEY
      );

    if (shouldRestore !== "true") {
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

    if (Number.isNaN(scrollPosition)) {
      sessionStorage.removeItem(
        SCROLL_STORAGE_KEY
      );

      setScrollRestored(true);
      return;
    }

    const frame =
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: "instant",
        });

        requestAnimationFrame(() => {
          setScrollRestored(true);
        });
      });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    filtersLoaded,
    scrollRestored,
    filteredLives.length,
  ]);

  // ========================================
  // 条件リセット
  // ========================================

  const resetFilters = () => {
    setKeyword("");
    setYear("すべて");
    setMonth("すべて");
    setSetlistFilter("すべて");
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
  // ライブ詳細へ移動する前に
  // 現在のスクロール位置を保存
  // ========================================

  const saveScrollPosition = () => {
    sessionStorage.setItem(
      SCROLL_STORAGE_KEY,
      String(window.scrollY)
    );

    sessionStorage.setItem(
      RESTORE_STORAGE_KEY,
      "true"
    );
  };

  return (
    <main
      className={`min-h-screen bg-white pb-36 text-zinc-900 ${
        filtersLoaded && scrollRestored
          ? "visible"
          : "invisible"
      }`}
    >
      {/* ================================= */}
      {/* HOMEと共通のページ幅・余白 */}
      {/* ================================= */}

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        {/* ================================= */}
        {/* ページヘッダー */}
        {/* ================================= */}

        <div>
          <h1 className="text-3xl font-bold text-[#14526B]">
            LIVE
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
            ライブ・セットリスト一覧
          </p>
        </div>

        {/* ================================= */}
        {/* 検索エリア */}
        {/* ================================= */}

        <section className="mt-8">

          {/* 検索ボックス */}
          <div className="relative z-10">
            <input
              type="search"
              value={keyword}
              onChange={(e) =>
                setKeyword(e.target.value)
              }
              placeholder="曲名・都市・公演名を検索"
              autoComplete="off"
              enterKeyHint="search"
              className="relative z-10 w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-4 pr-12 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-[#14526B] focus:ring-2 focus:ring-[#14526B]/10"
            />

            {keyword && (
              <button
                type="button"
                onClick={() =>
                  setKeyword("")
                }
                className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-xl text-zinc-400 active:bg-zinc-100"
                aria-label="検索文字を消去"
              >
                ×
              </button>
            )}
          </div>

          {/* ================================= */}
          {/* 年代フィルター */}
          {/* ================================= */}

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">

            <button
              type="button"
              onClick={() => {
                setYear("すべて");
                setMonth("すべて");
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-medium transition ${
                year === "すべて"
                  ? "border-[#14526B] bg-[#14526B] text-white"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              すべて
            </button>

            {years.map((y: string) => (
              <button
                type="button"
                key={y}
                onClick={() => {
                  setYear(y);
                  setMonth("すべて");
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-medium transition ${
                  year === y
                    ? "border-[#14526B] bg-[#14526B] text-white"
                    : "border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                {y}
              </button>
            ))}

          </div>

          {/* ================================= */}
          {/* 月フィルター */}
          {/* ================================= */}

          {year !== "すべて" && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">

              <button
                type="button"
                onClick={() =>
                  setMonth("すべて")
                }
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition ${
                  month === "すべて"
                    ? "border-[#14526B] bg-[#14526B] text-white"
                    : "border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                すべて
              </button>

              {months.map((m: string) => (
                <button
                  type="button"
                  key={m}
                  onClick={() =>
                    setMonth(m)
                  }
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition ${
                    month === m
                      ? "border-[#14526B] bg-[#14526B] text-white"
                      : "border-zinc-200 bg-white text-zinc-600"
                  }`}
                >
                  {Number(m)}月
                </button>
              ))}

            </div>
          )}

          {/* ================================= */}
          {/* セトリ・参戦済みフィルター */}
          {/* ================================= */}

          <div className="mt-2 flex flex-wrap items-center gap-2">

            {/* セトリあり */}
            <button
              type="button"
              onClick={() =>
                setSetlistFilter(
                  setlistFilter === "あり"
                    ? "すべて"
                    : "あり"
                )
              }
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                setlistFilter === "あり"
                  ? "border-[#14526B] bg-[#14526B] text-white"
                  : "border-zinc-200 bg-white text-[#14526B]"
              }`}
            >
              セトリあり
            </button>

            {/* セトリなし */}
            <button
              type="button"
              onClick={() =>
                setSetlistFilter(
                  setlistFilter === "なし"
                    ? "すべて"
                    : "なし"
                )
              }
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                setlistFilter === "なし"
                  ? "border-[#14526B] bg-[#14526B] text-white"
                  : "border-zinc-200 bg-white text-[#14526B]"
              }`}
            >
              セトリなし
            </button>

            {/* 参戦済み */}
            <button
              type="button"
              onClick={() => {
                loadAttendedLives();
                setAttendedOnly(!attendedOnly);
              }}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] font-semibold transition ${
                attendedOnly
                  ? "border-[#14526B] bg-[#14526B] text-white"
                  : "border-zinc-200 bg-white text-[#14526B]"
              }`}
            >
              <span className="text-[14px] leading-none">
                {attendedOnly ? "♥" : "♡"}
              </span>

              参戦済み
            </button>

          </div>

        </section>

        {/* ================================= */}
        {/* 件数 */}
        {/* ================================= */}

        <div className="mt-5 flex items-center justify-between gap-4">

          <p className="shrink-0 text-sm text-zinc-500">
            {filteredLives.length}件
          </p>

          {(keyword ||
            year !== "すべて" ||
            month !== "すべて" ||
            setlistFilter !== "すべて" ||
            attendedOnly) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-[#14526B]"
            >
              条件をリセット
            </button>
          )}

        </div>

        {/* ================================= */}
        {/* ライブ一覧 */}
        {/* ================================= */}

        <div className="mt-4 space-y-2.5">

          {filteredLives.map(
            (live: Live) => (
              <div
                key={live.id}
                className="relative rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-[#14526B] hover:shadow-md"
              >

                <Link
                  href={`/live/${live.id}`}
                  onClick={saveScrollPosition}
                  className="block px-4 py-3 pr-16"
                >

                  {/* 日付 */}
                  <p className="text-[13px] font-semibold leading-tight text-[#14526B]">
                    {live.date}
                  </p>

                  {/* 公演名 */}
                  <h2 className="mt-1 text-[18px] font-bold leading-snug text-[#14526B]">
                    {live.title}
                  </h2>

                  {/* 都市・会場 */}
                  <p className="mt-1.5 text-[14px] leading-tight text-zinc-500">

                    <span className="font-medium text-[#14526B]">
                      {live.city}
                    </span>

                    <span className="mx-2 text-zinc-300">
                      ｜
                    </span>

                    {live.venue}

                  </p>

                  {/* ツアー・セトリ掲載状況 */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">

                    {live.tour && (
                      <span className="inline-block rounded-full bg-[#14526B]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#14526B]">
                        {live.tour}
                      </span>
                    )}

                    {live.setlist.length > 0 ? (
                      <span className="inline-block rounded-full bg-[#14526B]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#14526B]">
                        セトリあり
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
                        セトリなし
                      </span>
                    )}

                  </div>

                </Link>

                {/* 参戦ボタン */}
                <div
                  className="absolute right-3 top-3"
                  onClick={() => {
                    setTimeout(() => {
                      loadAttendedLives();
                    }, 0);
                  }}
                >
                  <AttendedIconButton
                    liveId={live.id}
                  />
                </div>

              </div>
            )
          )}

        </div>

        {/* ================================= */}
        {/* 検索結果なし */}
        {/* ================================= */}

        {filteredLives.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 px-4 py-10 text-center sm:px-6 sm:py-12">

            <p className="font-semibold text-zinc-700">
              {attendedOnly
                ? "条件に一致する参戦ライブがありません"
                : "ライブが見つかりませんでした"}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              検索条件を変更してみてください
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-full bg-[#14526B] px-5 py-2.5 text-sm font-medium text-white"
            >
              検索条件をリセット
            </button>

          </div>
        )}

      </div>
    </main>
  );
}