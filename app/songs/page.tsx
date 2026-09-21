"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { lives } from "../../data/lives";
import { songReadings } from "../../data/songReadings";

type SortType = "count" | "name";

// SONGS一覧に表示しない曲
const hiddenSongs = [
  "ミュージックプランクトン(SAKANAMONカバー)",
  "暮らし（Hwylカバー）",
  "曲名C",
];

// 保存用キー
const FILTER_STORAGE_KEY = "songSearchFilters";
const SCROLL_STORAGE_KEY = "songSearchScrollPosition";
const RESTORE_STORAGE_KEY = "songShouldRestoreScroll";

export default function SongsPage() {
  const [keyword, setKeyword] = useState("");
  const [sortType, setSortType] =
    useState<SortType>("count");

  const [filtersLoaded, setFiltersLoaded] =
    useState(false);

  const [scrollRestored, setScrollRestored] =
    useState(false);

  // ========================================
  // 検索条件を復元
  // ========================================

  useEffect(() => {
    const savedFilters =
      sessionStorage.getItem(FILTER_STORAGE_KEY);

    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);

        if (typeof parsed.keyword === "string") {
          setKeyword(parsed.keyword);
        }

        if (
          parsed.sortType === "count" ||
          parsed.sortType === "name"
        ) {
          setSortType(parsed.sortType);
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
  // 検索条件を保存
  // ========================================

  useEffect(() => {
    if (!filtersLoaded) return;

    sessionStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({
        keyword,
        sortType,
      })
    );
  }, [
    keyword,
    sortType,
    filtersLoaded,
  ]);

  // ========================================
  // 全楽曲を集計
  // ========================================

  const songs = useMemo(() => {
    const allSongs = lives.flatMap((live) => [
      ...live.setlist,
      ...(live.encore ?? []),
    ]);

    const uniqueSongs = [
      ...new Set(allSongs),
    ].filter(
      (song) => !hiddenSongs.includes(song)
    );

    return uniqueSongs.map((song) => {
      const count = lives.filter((live) => {
        const playedSongs = [
          ...live.setlist,
          ...(live.encore ?? []),
        ];

        return playedSongs.includes(song);
      }).length;

      return {
        name: song,
        count,
      };
    });
  }, []);

  // ========================================
  // 検索 + 並び替え
  // ========================================

  const displayedSongs = useMemo(() => {
    const q = keyword
      .trim()
      .toLocaleLowerCase("ja");

    const filtered = songs.filter((song) => {
      const name =
        song.name.toLocaleLowerCase("ja");

      const reading =
        (
          songReadings[song.name] ?? ""
        ).toLocaleLowerCase("ja");

      return (
        name.includes(q) ||
        reading.includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      // 50音順
      if (sortType === "name") {
        const readingA =
          songReadings[a.name] ?? a.name;

        const readingB =
          songReadings[b.name] ?? b.name;

        return readingA.localeCompare(
          readingB,
          "ja",
          {
            sensitivity: "base",
          }
        );
      }

      // 演奏回数順
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      // 同じ演奏回数なら50音順
      const readingA =
        songReadings[a.name] ?? a.name;

      const readingB =
        songReadings[b.name] ?? b.name;

      return readingA.localeCompare(
        readingB,
        "ja",
        {
          sensitivity: "base",
        }
      );
    });
  }, [
    songs,
    keyword,
    sortType,
  ]);

  // ========================================
  // スクロール位置を復元
  // 曲詳細から戻ったときだけ実行
  // ========================================

  useEffect(() => {
    if (!filtersLoaded) return;
    if (scrollRestored) return;

    const shouldRestore =
      sessionStorage.getItem(
        RESTORE_STORAGE_KEY
      );

    // 曲詳細から戻ってきたわけではない
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

    // フラグは1回使ったら削除
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

    // 検索・並び替えが反映されてから復元
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
    displayedSongs.length,
  ]);

  // ========================================
  // 曲詳細へ移動
  // ========================================

  const saveScrollPosition = () => {
    // 現在位置を保存
    sessionStorage.setItem(
      SCROLL_STORAGE_KEY,
      String(window.scrollY)
    );

    // 次にSONGSへ戻ったときだけ復元
    sessionStorage.setItem(
      RESTORE_STORAGE_KEY,
      "true"
    );
  };

  // ========================================
  // 検索リセット
  // ========================================

  const resetSearch = () => {
    setKeyword("");

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

return (
  <main
    className={`min-h-screen bg-white pb-28 text-zinc-900 ${
      filtersLoaded && scrollRestored
        ? "visible"
        : "invisible"
    }`}
  >
    <div className="mx-auto max-w-3xl px-6 py-10">

      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-[#14526B]">
          SONGS
        </h1>

        <p className="mt-2 text-[14px] text-zinc-500">
          楽曲一覧
        </p>
      </div>

      {/* 検索 */}
      <div className="relative mt-7">
        <input
          type="search"
          value={keyword}
          onChange={(e) =>
            setKeyword(e.target.value)
          }
          placeholder="曲名を検索"
          autoComplete="off"
          enterKeyHint="search"
          className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 pr-12 text-[15px] text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-[#14526B] focus:ring-2 focus:ring-[#14526B]/10"
        />

        {keyword && (
          <button
            type="button"
            onClick={() =>
              setKeyword("")
            }
            aria-label="検索文字を消去"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-xl text-zinc-400 transition hover:bg-zinc-100"
          >
            ×
          </button>
        )}
      </div>

      {/* 並び替え */}
      <div className="mt-4 flex gap-2">

        <button
          type="button"
          onClick={() =>
            setSortType("count")
          }
          className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
            sortType === "count"
              ? "border-[#14526B] bg-[#14526B] text-white"
              : "border-zinc-200 bg-white text-zinc-500 hover:border-[#14526B] hover:text-[#14526B]"
          }`}
        >
          演奏回数順
        </button>

        <button
          type="button"
          onClick={() =>
            setSortType("name")
          }
          className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
            sortType === "name"
              ? "border-[#14526B] bg-[#14526B] text-white"
              : "border-zinc-200 bg-white text-zinc-500 hover:border-[#14526B] hover:text-[#14526B]"
          }`}
        >
          50音順
        </button>

      </div>

      {/* 曲数 */}
      <div className="mt-6 flex items-end justify-between">

        <p className="text-[13px] text-zinc-400">
          {keyword
            ? `${displayedSongs.length} 曲`
            : `全 ${songs.length} 曲`}
        </p>

        <p className="text-[11px] font-medium text-zinc-400">
          {sortType === "count"
            ? "演奏回数順"
            : "50音順"}
        </p>

      </div>

      {/* 楽曲一覧 */}
      <div className="mt-3 space-y-2.5">

        {displayedSongs.map(
          (song, index) => (
            <Link
              key={song.name}
              href={`/songs/${encodeURIComponent(
                song.name
              )}`}
              onClick={
                saveScrollPosition
              }
              className="flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:border-[#14526B] hover:shadow-md"
            >

              <span className="w-10 shrink-0 text-[12px] font-bold text-zinc-300">
                {String(
                  index + 1
                ).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">

                <p className="truncate text-[16px] font-bold text-[#14526B]">
                  {song.name}
                </p>

                <p className="mt-1 text-[11px] text-zinc-400">
                  {song.count}公演で演奏
                </p>

              </div>

              <span className="ml-3 shrink-0 text-[13px] text-zinc-300">
                →
              </span>

            </Link>
          )
        )}

      </div>

      {/* 検索結果なし */}
      {displayedSongs.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center">

          <p className="font-semibold text-zinc-700">
            楽曲が見つかりませんでした
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            別の曲名で検索してみてください
          </p>

          <button
            type="button"
            onClick={resetSearch}
            className="mt-5 rounded-full bg-[#14526B] px-5 py-2.5 text-sm font-medium text-white"
          >
            検索をリセット
          </button>

        </div>
      )}

    </div>
  </main>
);
}