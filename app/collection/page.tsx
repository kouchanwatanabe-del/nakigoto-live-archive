"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { lives } from "../../data/lives";

type Live = (typeof lives)[number];

type Tab = "lives" | "heard" | "unheard";

// ========================================
// カバー曲かどうか判定
// 「カバー」を含む曲はCOLLECTIONの楽曲集計から除外
// ========================================

const isCoverSong = (song: string) => {
  return song.includes("カバー");
};

export default function CollectionPage() {
  const [attendedIds, setAttendedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 最初に表示するタブ
  const [activeTab, setActiveTab] = useState<Tab>("lives");

  useEffect(() => {
    const saved = localStorage.getItem("attendedLives");

    if (saved) {
      try {
        const ids: string[] = JSON.parse(saved);
        setAttendedIds(ids);
      } catch {
        setAttendedIds([]);
      }
    }

    setLoaded(true);
  }, []);

  // ========================================
  // 参戦したライブ
  // ========================================

  const attendedLives = lives
    .filter((live: Live) =>
      attendedIds.includes(live.id)
    )
    .sort((a, b) =>
      b.date.localeCompare(a.date)
    );

  // ========================================
  // サイトに登録されている全楽曲
  // カバー曲は除外
  // ========================================

  const allSongs = [
    ...new Set(
      lives
        .flatMap((live: Live) => [
          ...live.setlist,
          ...(live.encore ?? []),
        ])
        .filter((song) => !isCoverSong(song))
    ),
  ];

  // ========================================
  // 参戦ライブで聴いた曲と回数
  // ========================================

  const heardSongCounts: Record<string, number> = {};

  attendedLives.forEach((live) => {
    // 同じ公演で同じ曲が複数回あっても1回としてカウント
    // カバー曲は除外
    const songs = [
      ...new Set(
        [
          ...live.setlist,
          ...(live.encore ?? []),
        ].filter((song) => !isCoverSong(song))
      ),
    ];

    songs.forEach((song) => {
      heardSongCounts[song] =
        (heardSongCounts[song] ?? 0) + 1;
    });
  });

  // ========================================
  // 聴いた曲
  // ========================================

  const heardSongs = Object.entries(heardSongCounts)
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0].localeCompare(b[0], "ja");
    });

  // ========================================
  // まだ聴けていない曲
  // ========================================

  const unheardSongs = allSongs
    .filter((song) => !heardSongCounts[song])
    .sort((a, b) =>
      a.localeCompare(b, "ja")
    );

  // ========================================
  // コンプリート率
  // ========================================

  const completion =
    allSongs.length > 0
      ? Math.round(
          (heardSongs.length / allSongs.length) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">

      {/* ================================= */}
      {/* HOME・LIVE・SONGSと共通の幅・余白 */}
      {/* ================================= */}

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        {/* ================================= */}
        {/* ページヘッダー */}
        {/* ================================= */}

        <div>

          <h1 className="text-3xl font-bold text-[#14526B]">
            MY ARCHIVE
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
            あなたの参戦記録
          </p>

        </div>

        {/* ================================= */}
        {/* MY STATS */}
        {/* ================================= */}

        <Link
          href="/stats"
          className="mt-8 flex items-center justify-between rounded-xl border border-[#14526B]/20 bg-[#14526B]/5 px-4 py-3.5 transition hover:bg-[#14526B]/10"
        >

          <div>

            <p className="text-[14px] font-bold text-[#14526B]">
              MY STATS
            </p>

            <p className="mt-0.5 text-[11px] text-zinc-500">
              あなたのライブ統計を見る
            </p>

          </div>

          <span className="text-[#14526B]">
            →
          </span>

        </Link>

        {/* ================================= */}
        {/* 読み込み中 */}
        {/* ================================= */}

        {!loaded && (
          <div className="mt-8 text-[13px] text-zinc-400">
            読み込み中...
          </div>
        )}

        {loaded && (
          <>

            {/* ================================= */}
            {/* サマリー */}
            {/* ================================= */}

            <section className="mt-8 grid grid-cols-2 gap-3">

              {/* 参戦ライブ */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">

                <p className="text-[11px] text-zinc-400">
                  参戦ライブ
                </p>

                <div className="mt-2 flex items-end gap-1.5">

                  <span className="text-[32px] font-black leading-none text-[#14526B]">
                    {attendedLives.length}
                  </span>

                  <span className="text-[12px] text-zinc-500">
                    公演
                  </span>

                </div>

              </div>

              {/* 聴いた曲 */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">

                <p className="text-[11px] text-zinc-400">
                  聴いた曲
                </p>

                <div className="mt-2 flex items-end gap-1.5">

                  <span className="text-[32px] font-black leading-none text-[#14526B]">
                    {heardSongs.length}
                  </span>

                  <span className="text-[12px] text-zinc-500">
                    / {allSongs.length} 曲
                  </span>

                </div>

              </div>

            </section>

            {/* ================================= */}
            {/* コンプリート率 */}
            {/* ================================= */}

            <section className="mt-5">

              <div className="flex items-center justify-between">

                <p className="text-[12px] font-medium text-zinc-500">
                  楽曲コンプリート率
                </p>

                <p className="text-[12px] font-bold text-[#14526B]">
                  {completion}%
                </p>

              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">

                <div
                  className="h-full rounded-full bg-[#14526B] transition-all duration-500"
                  style={{
                    width: `${completion}%`,
                  }}
                />

              </div>

            </section>

            {/* ================================= */}
            {/* タブ */}
            {/* ================================= */}

            <div className="mt-8 grid grid-cols-3 rounded-xl bg-zinc-100 p-1">

              <button
                type="button"
                onClick={() => setActiveTab("lives")}
                className={`rounded-lg px-2 py-2.5 text-[12px] font-bold transition ${
                  activeTab === "lives"
                    ? "bg-[#14526B] text-white shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                参戦ライブ

                <span className="ml-1 opacity-70">
                  {attendedLives.length}
                </span>

              </button>

              <button
                type="button"
                onClick={() => setActiveTab("heard")}
                className={`rounded-lg px-2 py-2.5 text-[12px] font-bold transition ${
                  activeTab === "heard"
                    ? "bg-[#14526B] text-white shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                聴いた曲

                <span className="ml-1 opacity-70">
                  {heardSongs.length}
                </span>

              </button>

              <button
                type="button"
                onClick={() => setActiveTab("unheard")}
                className={`rounded-lg px-2 py-2.5 text-[12px] font-bold transition ${
                  activeTab === "unheard"
                    ? "bg-[#14526B] text-white shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                未聴曲

                <span className="ml-1 opacity-70">
                  {unheardSongs.length}
                </span>

              </button>

            </div>

            {/* ========================= */}
            {/* 参戦ライブ タブ */}
            {/* ========================= */}

            {activeTab === "lives" && (
              <section className="mt-6">

                <div className="mb-3 flex items-center justify-between">

                  <h2 className="text-[20px] font-bold text-[#14526B]">
                    参戦したライブ
                  </h2>

                  <span className="text-[12px] text-zinc-400">
                    {attendedLives.length}公演
                  </span>

                </div>

                {attendedLives.length > 0 ? (

                  <div className="-mx-4 overflow-hidden border-y border-zinc-200 bg-white sm:-mx-6">

                    {attendedLives.map((live: Live, index) => (
                      <Link
                        key={live.id}
                        href={`/live/${live.id}`}
                        className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 sm:px-6 ${
                          index !== attendedLives.length - 1
                            ? "border-b border-zinc-200"
                            : ""
                        }`}
                      >

                        <div className="min-w-0 flex-1">

                          {/* 日付 */}
                          <p className="text-[12px] font-medium text-[#14526B]">
                            {live.date}
                          </p>

                          {/* 公演名 */}
                          <h3 className="mt-1 text-[16px] font-bold leading-snug text-zinc-900">
                            {live.title}
                          </h3>

                          {/* 都市・会場 */}
                          <p className="mt-1 text-[12px] leading-5 text-zinc-500">

                            <span className="font-medium text-[#14526B]">
                              {live.city}
                            </span>

                            <span className="mx-2 text-zinc-300">
                              ｜
                            </span>

                            {live.venue}

                          </p>

                        </div>

                        <span className="shrink-0 text-[16px] text-zinc-300 transition-transform group-hover:translate-x-0.5">
                          ›
                        </span>

                      </Link>
                    ))}

                  </div>

                ) : (

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-8 text-center">

                    <p className="text-[14px] font-medium text-zinc-600">
                      まだ参戦記録がありません
                    </p>

                    <Link
                      href="/lives"
                      className="mt-3 inline-block text-[13px] font-medium text-[#14526B] hover:underline"
                    >
                      ライブを探す →
                    </Link>

                  </div>

                )}

              </section>
            )}

            {/* ========================= */}
            {/* 聴いた曲 タブ */}
            {/* ========================= */}

            {activeTab === "heard" && (
              <section className="mt-6">

                <div className="mb-3 flex items-center justify-between">

                  <h2 className="text-[20px] font-bold text-[#14526B]">
                    聴いた曲
                  </h2>

                  <span className="text-[12px] text-zinc-400">
                    {heardSongs.length}曲
                  </span>

                </div>

                {heardSongs.length > 0 ? (

                  <div className="-mx-4 overflow-hidden border-y border-zinc-200 bg-white sm:-mx-6">

                    {heardSongs.map(([song, count], index) => (
                      <Link
                        key={song}
                        href={`/songs/${encodeURIComponent(song)}`}
                        className={`group flex items-center px-4 py-3 transition-colors hover:bg-zinc-50 sm:px-6 ${
                          index !== heardSongs.length - 1
                            ? "border-b border-zinc-200"
                            : ""
                        }`}
                      >

                        {/* 順位 */}
                        <span className="w-9 shrink-0 text-[11px] font-bold tabular-nums text-zinc-300">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        {/* 曲名 */}
                        <span className="min-w-0 flex-1 text-[14px] font-semibold leading-[1.4] text-[#14526B]">
                          {song}
                        </span>

                        {/* 聴いた回数 */}
                        <span className="ml-3 shrink-0 text-[12px] font-medium text-[#14526B]">
                          {count}回
                        </span>

                        <span className="ml-3 shrink-0 text-[16px] text-zinc-300 transition-transform group-hover:translate-x-0.5">
                          ›
                        </span>

                      </Link>
                    ))}

                  </div>

                ) : (

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-8 text-center">

                    <p className="text-[14px] text-zinc-500">
                      まだ聴いた曲がありません
                    </p>

                  </div>

                )}

              </section>
            )}

            {/* ========================= */}
            {/* 未聴曲 タブ */}
            {/* ========================= */}

            {activeTab === "unheard" && (
              <section className="mt-6">

                <div className="mb-3 flex items-center justify-between">

                  <h2 className="text-[20px] font-bold text-[#14526B]">
                    まだ聴けていない曲
                  </h2>

                  <span className="text-[12px] text-zinc-400">
                    {unheardSongs.length}曲
                  </span>

                </div>

                {unheardSongs.length > 0 ? (

                  <div className="-mx-4 overflow-hidden border-y border-zinc-200 bg-white sm:-mx-6">

                    {unheardSongs.map((song, index) => (
                      <Link
                        key={song}
                        href={`/songs/${encodeURIComponent(song)}`}
                        className={`group flex items-center px-4 py-3 transition-colors hover:bg-zinc-50 sm:px-6 ${
                          index !== unheardSongs.length - 1
                            ? "border-b border-zinc-200"
                            : ""
                        }`}
                      >

                        <span className="min-w-0 flex-1 text-[14px] font-medium leading-[1.4] text-zinc-600">
                          {song}
                        </span>

                        <span className="ml-3 shrink-0 text-[16px] text-zinc-300 transition-transform group-hover:translate-x-0.5">
                          ›
                        </span>

                      </Link>
                    ))}

                  </div>

                ) : (

                  <div className="rounded-xl bg-[#14526B]/10 px-5 py-8 text-center">

                    <p className="text-[18px] font-bold text-[#14526B]">
                      全曲コンプリート！
                    </p>

                    <p className="mt-1 text-[12px] text-zinc-500">
                      登録されているすべての曲を聴いています
                    </p>

                  </div>

                )}

              </section>
            )}

          </>
        )}

      </div>
    </main>
  );
}