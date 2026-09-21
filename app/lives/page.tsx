"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lives } from "../../data/lives";
import AttendedIconButton from "../../components/AttendedIconButton";

type Live = (typeof lives)[number];

const FILTER_STORAGE_KEY = "liveSearchFilters";
const SCROLL_STORAGE_KEY = "liveSearchScrollPosition";
const RESTORE_STORAGE_KEY = "liveShouldRestoreScroll";

export default function LivesPage() {
  const [keyword, setKeyword] = useState("");
  const [year, setYear] = useState("すべて");

  // 参戦済みだけ表示するか
  const [attendedOnly, setAttendedOnly] = useState(false);

  // 参戦済みライブのID
  const [attendedIds, setAttendedIds] = useState<string[]>([]);

  // 保存済み条件の読み込みが終わったか
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // スクロール位置を復元したか
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
      attendedOnly,
    };

    sessionStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify(filters)
    );
  }, [
    keyword,
    year,
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
    attendedOnly,
    attendedIds,
  ]);

  // ========================================
  // スクロール位置を復元
  // ライブ詳細から戻ったときだけ実行
  // ========================================

  useEffect(() => {
    if (!filtersLoaded) return;
    if (scrollRestored) return;

    const shouldRestore =
      sessionStorage.getItem(
        RESTORE_STORAGE_KEY
      );

    // 詳細から戻ったわけではない
    if (shouldRestore !== "true") {
      sessionStorage.removeItem(
        SCROLL_STORAGE_KEY
      );

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });

      setScrollRestored(true);
      return;
    }

    const savedScroll =
      sessionStorage.getItem(
        SCROLL_STORAGE_KEY
      );

    // 復元フラグは1回だけ使用
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

    // 検索条件が反映されたあとに元の位置へ移動
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

    // 次にLIVEへ戻ったときだけ復元
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
    {/* テーマカラーのページ上部 */}
    {/* ================================= */}

    <div className="bg-[#14526B] pb-10 pt-7 text-white">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">

        <h1 className="text-3xl font-bold">
          LIVE
        </h1>

        <p className="mt-2 text-sm leading-6 text-white/70 sm:text-base">
          曲名・開催年・都市・公演名で検索できます。
        </p>

      </div>
    </div>

    {/* ================================= */}
    {/* 白いメインコンテンツ */}
    {/* ================================= */}

    <div className="mx-auto -mt-4 w-full max-w-3xl rounded-t-[24px] bg-white px-4 pt-6 sm:px-6">

      {/* ================================= */}
      {/* 検索エリア */}
      {/* ================================= */}

      <section>

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

            {/* 入力削除 */}
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
          {/* 参戦済みフィルター */}
          {/* ================================= */}

          <div className="mt-4">

            <button
              type="button"
              onClick={() => {
                loadAttendedLives();

                setAttendedOnly(
                  !attendedOnly
                );
              }}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                attendedOnly
                  ? "border-[#14526B] bg-[#14526B] text-white"
                  : "border-zinc-200 bg-white text-[#14526B]"
              }`}
            >

              <span className="text-base">
                {attendedOnly ? "♥" : "♡"}
              </span>

              参戦済みだけ

            </button>

          </div>

          {/* ================================= */}
          {/* 年代フィルター */}
          {/* ================================= */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">

            <button
              type="button"
              onClick={() =>
                setYear("すべて")
              }
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                year === "すべて"
                  ? "bg-[#14526B] text-white"
                  : "border border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              すべて
            </button>

            {years.map((y: string) => (
              <button
                type="button"
                key={y}
                onClick={() =>
                  setYear(y)
                }
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  year === y
                    ? "bg-[#14526B] text-white"
                    : "border border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                {y}
              </button>
            ))}

          </div>

        </section>

        {/* ================================= */}
        {/* 件数 */}
        {/* ================================= */}

        <div className="mt-6 flex items-center justify-between gap-4">

          <p className="shrink-0 text-sm text-zinc-500">
            {filteredLives.length}件
          </p>

          {(keyword ||
            year !== "すべて" ||
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

                {/* ライブ詳細へのリンク */}
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

                  {/* ツアー */}
                  {live.tour && (
                    <div className="mt-2">

                      <span className="inline-block rounded-full bg-[#14526B]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#14526B]">
                        {live.tour}
                      </span>

                    </div>
                  )}

                </Link>

                {/* ================================= */}
                {/* 参戦ボタン */}
                {/* ================================= */}

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
              {attendedOnly
                ? "検索条件や開催年を変更してみてください"
                : "検索条件を変更してみてください"}
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