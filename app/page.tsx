"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lives } from "../data/lives";

type Live = (typeof lives)[number];

// 日付が新しい順に並べて、最新3件だけ取得
const latestLives = [...lives]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 3);

// 楽曲ごとの演奏公演数を集計
const songCounts = lives.reduce<Record<string, number>>(
  (counts, live) => {
    const songs = [
      ...live.setlist,
      ...(live.encore ?? []),
    ];

    // 同じライブで同じ曲が複数回あっても1公演として数える
    const uniqueSongs = [...new Set(songs)];

    uniqueSongs.forEach((song) => {
      counts[song] = (counts[song] ?? 0) + 1;
    });

    return counts;
  },
  {}
);

// 演奏公演数が多い順に上位3曲
const frequentSongs = Object.entries(songCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);

export default function Home() {
  const [attendedIds, setAttendedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 参戦ライブをlocalStorageから取得
  useEffect(() => {
    const saved = localStorage.getItem("attendedLives");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setAttendedIds(parsed);
        }
      } catch {
        setAttendedIds([]);
      }
    }

    setLoaded(true);
  }, []);

  // 参戦したライブ
  const attendedLives = useMemo(() => {
    return lives.filter((live) =>
      attendedIds.includes(live.id)
    );
  }, [attendedIds]);

  // 参戦ライブで聴いた曲
  const heardSongs = useMemo(() => {
    const songs = attendedLives.flatMap((live) => [
      ...live.setlist,
      ...(live.encore ?? []),
    ]);

    // 重複している曲を1曲として数える
    return [...new Set(songs)];
  }, [attendedLives]);

  return (
    <main className="min-h-screen bg-white pb-28 text-[#14526B]">

      {/* HOMEコンテンツ */}
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        {/* ============================== */}
        {/* ページヘッダー */}
        {/* ============================== */}

        <div>
          <h1 className="text-3xl font-bold text-[#14526B]">
            HOME
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
            非公式ライブログ
          </p>
        </div>

        {/* ============================== */}
        {/* 最新ライブ */}
        {/* ============================== */}

        <section className="mt-8">

          <div className="mb-3.5 flex items-center justify-between text-[#14526B]">

            <h2 className="text-[22px] font-bold">
              LIVE
            </h2>

            <Link
              href="/lives"
              className="text-[13px] font-medium text-[#14526B] hover:underline"
            >
              VIEW ALL →
            </Link>

          </div>

          {/* ライブカード */}
          <div className="space-y-2">

            {latestLives.map((live: Live) => (
              <Link
                key={live.id}
                href={`/live/${live.id}`}
                className="block rounded-xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:border-[#14526B] hover:shadow-md"
              >

                {/* 日付 */}
                <p className="text-[12px] font-medium leading-tight text-[#14526B]">
                  {live.date}
                </p>

                {/* 公演名 */}
                <h3 className="mt-1 text-[17px] font-bold leading-snug text-[#14526B]">
                  {live.title}
                </h3>

                {/* 都市・会場・矢印 */}
                <div className="mt-1.5 flex items-center justify-between">

                 <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-[#14526B]">
    <span>{live.city}</span>

  {live.city && live.venue && (
    <span className="text-zinc-300">/</span>
  )}

  {live.venue && (
    <span>{live.venue}</span>
  )}
</div>

                  <span className="ml-3 shrink-0 text-[12px] text-zinc-400">
                    →
                  </span>

                </div>

              </Link>
            ))}

          </div>

        </section>

        {/* ============================== */}
        {/* 頻出曲 */}
        {/* ============================== */}

        <section className="mt-11">

          <div className="mb-3.5 flex items-center justify-between">

            <h2 className="text-[22px] font-bold text-[#14526B]">
              SONGS
            </h2>

            <Link
              href="/songs"
              className="text-[13px] font-medium text-[#14526B] hover:underline"
            >
              VIEW ALL →
            </Link>

          </div>

          {/* 頻出曲TOP3 */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">

            {frequentSongs.map(([song, count], index) => (
              <Link
                key={song}
                href={`/songs/${encodeURIComponent(song)}`}
                className="flex items-center border-b border-zinc-100 px-4 py-4 transition hover:bg-zinc-50 last:border-b-0"
              >

                {/* 順位 */}
                <span className="w-10 text-[13px] font-bold text-[#14526B]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* 曲名 */}
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#14526B]">
                  {song}
                </span>

                {/* 公演数 */}
                <span className="ml-3 shrink-0 text-[12px] text-zinc-400">
                  {count}公演
                </span>

                {/* 矢印 */}
                <span className="ml-3 text-[13px] text-zinc-300">
                  →
                </span>

              </Link>
            ))}

          </div>

        </section>

        {/* ============================== */}
        {/* COLLECTION */}
        {/* ============================== */}

        <section className="mt-11">

          {/* COLLECTIONタイトル */}
          <div className="mb-3.5 flex items-center justify-between">

            <h2 className="text-[22px] font-bold text-[#14526B]">
              MY PAGE
            </h2>

            <Link
              href="/collection"
              className="text-[13px] font-medium text-[#14526B] hover:underline"
            >
              VIEW ALL →
            </Link>

          </div>

          {/* COLLECTIONカード */}
          <Link
            href="/collection"
            className="block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:border-[#14526B] hover:shadow-md"
          >

            <div className="grid grid-cols-2 divide-x divide-zinc-200">

              {/* 参戦ライブ */}
              <div className="px-5 py-5">

                <p className="text-[11px] font-medium text-zinc-400">
                  参戦ライブ
                </p>

                <div className="mt-2 flex items-end gap-1.5">

                  <span className="text-[30px] font-black leading-none text-[#14526B]">
                    {loaded ? attendedLives.length : "—"}
                  </span>

                  <span className="text-[12px] font-medium text-zinc-500">
                    公演
                  </span>

                </div>

              </div>

              {/* 聴いた曲 */}
              <div className="px-5 py-5">

                <p className="text-[11px] font-medium text-zinc-400">
                  聴いた曲
                </p>

                <div className="mt-2 flex items-end gap-1.5">

                  <span className="text-[30px] font-black leading-none text-[#14526B]">
                    {loaded ? heardSongs.length : "—"}
                  </span>

                  <span className="text-[12px] font-medium text-zinc-500">
                    曲
                  </span>

                </div>

              </div>

            </div>

          </Link>

        </section>

      </div>

    </main>
  );
}