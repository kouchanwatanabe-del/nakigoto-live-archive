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
  "HEAT(FINLANDSカバー)",
  "ホワイトアウト(reGretGirlカバー)",
  "ホワイトアウト（reGretGirlカバー）",
  "ミュージックプランクトン（SAKANAMONカバー）",
  "秘密（ドラマストアカバー）",
  "キャロラインの花束を(the quiet roomカバー)",
  "ノックブーツ（Chevonカバー）",
  "Rambler（雨音コンプレックス）",
  "SUPIKA（雨音コンプレックス）",
  "メトロポリタン（feat.宮崎一晴）",
  "安酒にロマンス（仮）",
  "虫けら'20",
  "19",
  "秘密",
  "社会のゴミカザマタカフミ（3markets[]カバー）",
  "透明な硝子のイノセンス（小林私書き下ろし）",
  "ウーロンハイと春に",
  "移ろう季節に花束を",
];

// 保存用キー
const FILTER_STORAGE_KEY = "songSearchFilters";
const SCROLL_STORAGE_KEY = "songSearchScrollPosition";
const RESTORE_STORAGE_KEY = "songShouldRestoreScroll";


type SongsTab = "list" | "stats";

type RankedSong = { name: string; count: number };

// イベント分類を厳密にしたい公演は lives.ts に eventType を追加
// eventType: "festival" | "taiban" | "one-man" | "self-produced" | "other"
function isFestivalOrTaiban(live: (typeof lives)[number]): boolean {
  const item = live as typeof live & {
    eventType?: string;
    artists?: string[];
  };
  if (item.eventType) {
    return item.eventType === "festival" || item.eventType === "taiban";
  }

  const name = `${live.title} ${live.tour ?? ""}`;
  if (/ワンマン|ONE[ -]?MAN|FC限定|ファンクラブ|自主企画|人間日和|ニンゲン.s感謝祭|SIKI ORIORI|Summer祭/i.test(name)) {
    return false;
  }
  if (/フェス|FES|FEST|ROCK IN JAPAN|COUNTDOWN JAPAN|JAPAN JAM|MINAMI WHEEL|TOKYO CALLING|MURO FESTIVAL|MONSTER baSH|NUMBER SHOT|ツタロック|対バン|2MAN|TWO[ -]?MAN|3MAN|MUSIC YOKAJA/i.test(name)) {
    return true;
  }
  return (item.artists ?? []).some((artist) => artist !== "なきごと");
}

function rankSongs(names: string[]): RankedSong[] {
  const counts = new Map<string, number>();
  names.forEach((name) => {
    if (!name || hiddenSongs.includes(name)) return;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return [...counts].map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count ||
      (songReadings[a.name] ?? a.name).localeCompare(songReadings[b.name] ?? b.name, "ja"));
}

function StatsRanking({
  title,
  subtitle,
  ranking,
  total,
  onSongClick,
}: {
  title: string;
  subtitle: string;
  ranking: RankedSong[];
  total: number;
  onSongClick: () => void;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold tracking-wide text-[#14526B]">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{subtitle}</p>
      {ranking.length === 0 ? (
        <p className="mt-4 rounded-xl bg-zinc-50 p-5 text-sm text-zinc-500">集計できる公演がありません</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
          {ranking.map((song, index) => (
            <Link
              key={song.name}
              href={`/songs/${encodeURIComponent(song.name)}`}
              onClick={onSongClick}
              className={`block px-4 py-3 transition hover:bg-zinc-50 ${index ? "border-t border-zinc-100" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 shrink-0 text-xs tabular-nums text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-[#14526B]">{song.name}</span>
                    <span className="shrink-0 text-xs tabular-nums text-zinc-500">{song.count}{total > 0 ? ` / ${total}公演` : "回"}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-[#14526B]" style={{ width: `${total > 0 ? song.count / total * 100 : song.count / ranking[0].count * 100}%` }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default function SongsPage() {
  const [tab, setTab] = useState<SongsTab>("list");
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
        if (parsed.tab === "list" || parsed.tab === "stats") setTab(parsed.tab);

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
        tab,
      })
    );
  }, [
    keyword,
    sortType,
    tab,
    filtersLoaded,
  ]);

  // ========================================
  // 全楽曲を集計
  // ========================================

 const songs = useMemo(() => {
  // SONGSの集計対象にするライブだけ
  const songHistoryLives = lives.filter(
    (live) =>
      live.excludeFromSongHistory !== true
  );

  // 対象ライブから全楽曲を取得
  const allSongs = songHistoryLives.flatMap(
    (live) => [
      ...live.setlist,
      ...(live.encore ?? []),
    ]
  );

  // 重複を削除
  const uniqueSongs = [
    ...new Set(allSongs),
  ].filter(
    (song) => !hiddenSongs.includes(song)
  );

  // 各曲の演奏公演数
  return uniqueSongs.map((song) => {
    const count = songHistoryLives.filter(
      (live) => {
        const playedSongs = [
          ...live.setlist,
          ...(live.encore ?? []),
        ];

        return playedSongs.includes(song);
      }
    ).length;

    return {
      name: song,
      count,
    };
  });
}, []);

  // ========================================
  // セトリ統計（登録済み・過去公演のみ）
  // ========================================
  const statistics = useMemo(() => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    const history = lives
      .filter((live) => {
        const dateKey = live.date.replace(/\D/g, "").slice(0, 8);
        return dateKey.length === 8 && dateKey <= todayKey &&
          live.excludeFromSongHistory !== true &&
          Array.isArray(live.setlist) && live.setlist.length > 0;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

    const recentAll = history.slice(0, 10);
    const recentFestival = history.filter(isFestivalOrTaiban).slice(0, 10);
    const played = (selected: typeof history) =>
      rankSongs(selected.flatMap((live) => [...new Set([...live.setlist, ...(live.encore ?? [])])]));

    return {
      recentAll,
      recentFestival,
      allRanking: played(recentAll),
      festivalRanking: played(recentFestival),
      openingRanking: rankSongs(history.map((live) => live.setlist[0]).filter(Boolean)),
      closingRanking: rankSongs(history.map((live) => live.setlist[live.setlist.length - 1]).filter(Boolean)),
      totalShows: history.length,
    };
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
      {/* ================================= */}
      {/* HOME・LIVEと共通のページ幅・余白 */}
      {/* ================================= */}

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        {/* ================================= */}
        {/* ページヘッダー */}
        {/* ================================= */}

        <div>
          <h1 className="text-3xl font-bold text-[#14526B]">
            SONGS
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
            
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1">
          {(["list", "stats"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => { setTab(value); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className={`rounded-xl px-2 py-3 text-xs font-bold tracking-wide transition sm:text-sm ${tab === value ? "bg-[#14526B] text-white shadow-sm" : "text-zinc-500 hover:text-[#14526B]"}`}
            >
              {value === "list" ? "SONG LIST" : "SETLIST STATS"}
            </button>
          ))}
        </div>

        {tab === "list" ? (
          <>
        {/* ================================= */}
        {/* 検索 */}
        {/* ================================= */}

        <div className="relative mt-8">

          <input
            type="search"
            value={keyword}
            onChange={(e) =>
              setKeyword(e.target.value)
            }
            placeholder="曲名を検索"
            autoComplete="off"
            enterKeyHint="search"
            className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-4 pr-12 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-[#14526B] focus:ring-2 focus:ring-[#14526B]/10"
          />

          {keyword && (
            <button
              type="button"
              onClick={() =>
                setKeyword("")
              }
              aria-label="検索文字を消去"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-xl text-zinc-400 transition hover:bg-zinc-100"
            >
              ×
            </button>
          )}

        </div>

        {/* ================================= */}
        {/* 並び替え */}
        {/* ================================= */}

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

        {/* ================================= */}
        {/* 曲数 */}
        {/* ================================= */}

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

       {/* ================================= */}
{/* 楽曲一覧 */}
{/* ================================= */}

<div className="mt-3 -mx-4 overflow-hidden border-y border-zinc-200 bg-white sm:-mx-6">

  {displayedSongs.map(
    (song, index) => (
      <Link
        key={song.name}
        href={`/songs/${encodeURIComponent(
          song.name
        )}`}
        onClick={saveScrollPosition}
        className={`flex items-center px-4 py-3 transition-colors hover:bg-zinc-50 sm:px-6 ${
          index !== displayedSongs.length - 1
            ? "border-b border-zinc-200"
            : ""
        }`}
      >

        {/* 順位 */}
        <span className="w-9 shrink-0 text-[11px] font-medium tabular-nums text-zinc-300">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* 曲情報 */}
        <div className="min-w-0 flex-1">

          <p className="text-[16px] font-bold leading-[1.35] text-[#14526B]">
            {song.name}
          </p>

          <p className="mt-0.5 text-[11px] text-zinc-400">
            {song.count}公演で演奏
          </p>

        </div>

        {/* 矢印 */}
        <span className="ml-3 shrink-0 text-[16px] text-zinc-300">
          ›
        </span>

      </Link>
    )
  )}

</div>

        {/* ================================= */}
        {/* 検索結果なし */}
        {/* ================================= */}

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
          </>
        ) : (
          <>
            <StatsRanking
              title="LAST 10 SHOWS"
              subtitle={`全公演・直近${statistics.recentAll.length}公演（アンコール含む）`}
              ranking={statistics.allRanking}
              total={statistics.recentAll.length}
              onSongClick={saveScrollPosition}
            />
            <StatsRanking
              title="FESTIVAL & SUPPORT"
              subtitle={`フェス・対バンの直近${statistics.recentFestival.length}公演（アンコール含む）`}
              ranking={statistics.festivalRanking}
              total={statistics.recentFestival.length}
              onSongClick={saveScrollPosition}
            />
            <StatsRanking
              title="OPENING SONGS"
              subtitle={`全${statistics.totalShows}公演の本編1曲目`}
              ranking={statistics.openingRanking}
              total={statistics.totalShows}
              onSongClick={saveScrollPosition}
            />
            <StatsRanking
              title="CLOSING SONGS"
              subtitle={`全${statistics.totalShows}公演の本編最終曲（アンコール除外）`}
              ranking={statistics.closingRanking}
              total={statistics.totalShows}
              onSongClick={saveScrollPosition}
            />
          </>
        )}

      </div>
    </main>
  );
}