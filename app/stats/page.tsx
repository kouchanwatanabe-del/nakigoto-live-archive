"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Building2,
  Trophy,
  Music2,
  CalendarDays,
} from "lucide-react";

import { lives } from "../../data/lives";

type Live = (typeof lives)[number];

export default function StatsPage() {
  const [attendedIds, setAttendedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // ========================================
  // 参戦記録を読み込む
  // ========================================

  useEffect(() => {
    const saved = localStorage.getItem("attendedLives");

    if (saved) {
      try {
        setAttendedIds(JSON.parse(saved));
      } catch {
        setAttendedIds([]);
      }
    }

    setLoaded(true);
  }, []);

  // ========================================
  // 参戦したライブ
  // ========================================

  const attendedLives = useMemo(() => {
    return lives
      .filter((live: Live) =>
        attendedIds.includes(live.id)
      )
      .sort((a, b) =>
        b.date.localeCompare(a.date)
      );
  }, [attendedIds]);

  // ========================================
  // 楽曲ごとの聴いた回数
  // ========================================

  const songCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    attendedLives.forEach((live) => {
      // 同じライブで同じ曲が複数回あっても1回としてカウント
      const songs = [
        ...new Set([
          ...live.setlist,
          ...(live.encore ?? []),
        ]),
      ];

      songs.forEach((song) => {
        counts[song] =
          (counts[song] ?? 0) + 1;
      });
    });

    return counts;
  }, [attendedLives]);

  // ========================================
  // 楽曲ランキング
  // ========================================

  const songRanking = useMemo(() => {
    return Object.entries(songCounts)
      .sort((a, b) => {
        // 回数が多い順
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }

        // 同じ回数なら曲名順
        return a[0].localeCompare(b[0], "ja");
      });
  }, [songCounts]);

  // 一番聴いた曲
  const mostPlayedSong = songRanking[0];

  // TOP5
  const topFiveSongs = songRanking.slice(0, 5);

  // ========================================
  // 年別参戦数
  // ========================================

  const yearlyCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    attendedLives.forEach((live) => {
      const year = live.date.slice(0, 4);

      counts[year] =
        (counts[year] ?? 0) + 1;
    });

    return Object.entries(counts).sort(
      (a, b) => b[0].localeCompare(a[0])
    );
  }, [attendedLives]);

  // 年別参戦数の最大値
  const maxYearCount =
    yearlyCounts.length > 0
      ? Math.max(
          ...yearlyCounts.map(([, count]) => count)
        )
      : 0;

  // ========================================
  // 会場ランキング
  // ========================================

  const venueRanking = useMemo(() => {
    const counts: Record<string, number> = {};

    attendedLives.forEach((live) => {
      counts[live.venue] =
        (counts[live.venue] ?? 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }

        return a[0].localeCompare(b[0], "ja");
      });
  }, [attendedLives]);

  // ========================================
  // 都市ランキング
  // ========================================

  const cityRanking = useMemo(() => {
    const counts: Record<string, number> = {};

    attendedLives.forEach((live) => {
      counts[live.city] =
        (counts[live.city] ?? 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }

        return a[0].localeCompare(b[0], "ja");
      });
  }, [attendedLives]);

  // ========================================
  // 読み込み中
  // ========================================

  if (!loaded) {
    return (
      <main className="min-h-screen bg-white pb-28">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <p className="text-sm text-zinc-400">
            読み込み中...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-32 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* ================================= */}
        {/* 戻る */}
        {/* ================================= */}

        <Link
          href="/collection"
          className="text-[13px] font-medium text-[#14526B] hover:underline"
        >
          ← MY PAGE
        </Link>

        {/* ================================= */}
        {/* ヘッダー */}
        {/* ================================= */}

        <div className="mt-7">

          <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-400">
            MY LIVE ARCHIVE
          </p>

          <h1 className="mt-2 text-3xl font-black text-[#14526B]">
            STATS
          </h1>

          <p className="mt-2 text-[14px] text-zinc-500">
            あなたのライブ統計
          </p>

        </div>

        {/* ================================= */}
        {/* 参戦記録なし */}
        {/* ================================= */}

        {attendedLives.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-10 text-center">

            <p className="font-semibold text-zinc-700">
              まだ統計データがありません
            </p>

            <p className="mt-2 text-[13px] text-zinc-500">
              ライブに参戦記録をつけると自動で集計されます
            </p>

            <Link
              href="/lives"
              className="mt-5 inline-block rounded-full bg-[#14526B] px-5 py-2.5 text-[13px] font-bold text-white"
            >
              ライブを探す
            </Link>

          </div>
        ) : (
          <>

            {/* ================================= */}
            {/* MOST PLAYED */}
            {/* ================================= */}

            {mostPlayedSong && (
              <section className="mt-8">

                <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-zinc-400">
                  MOST PLAYED
                </p>

                <Link
                  href={`/songs/${encodeURIComponent(
                    mostPlayedSong[0]
                  )}`}
                  className="flex items-center rounded-2xl bg-[#14526B] p-5 text-white shadow-sm transition hover:opacity-95"
                >

                  {/* アイコン */}
                  <div className="mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <Trophy size={21} />
                  </div>

                  {/* 曲名 */}
                  <div className="min-w-0 flex-1">

                    <p className="text-[11px] text-white/60">
                      一番よく聴いた曲
                    </p>

                    <p className="mt-1 truncate text-[19px] font-bold text-[#14526B]">
                      {mostPlayedSong[0]}
                    </p>

                  </div>

                  {/* 回数 */}
                  <div className="ml-3 shrink-0 text-right">

                    <span className="text-[24px] font-black">
                      {mostPlayedSong[1]}
                    </span>

                    <span className="ml-1 text-[11px] text-white/70">
                      回
                    </span>

                  </div>

                </Link>

              </section>
            )}

            {/* ================================= */}
            {/* 年別参戦数 */}
            {/* ================================= */}

            <section className="mt-8">

              <div className="mb-3 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <CalendarDays
                    size={16}
                    className="text-[#14526B]"
                  />

                  <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-400">
                    YEARLY LIVE
                  </p>

                </div>

                <p className="text-[11px] text-zinc-400">
                  年別参戦数
                </p>

              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

                <div className="space-y-5">

                  {yearlyCounts.map(([year, count]) => (
                    <div key={year}>

                      {/* 年・公演数 */}
                      <div className="flex items-center justify-between">

                        <span className="text-[15px] font-bold text-[#14526B]">
                          {year}
                        </span>

                        <div className="flex items-end gap-1">

                          <span className="text-[18px] font-black leading-none text-[#14526B]">
                            {count}
                          </span>

                          <span className="text-[11px] text-zinc-400">
                            公演
                          </span>

                        </div>

                      </div>

                      {/* バー */}
                      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-zinc-100">

                        <div
                          className="h-full rounded-full bg-[#14526B] transition-all duration-500"
                          style={{
                            width:
                              maxYearCount > 0
                                ? `${(count / maxYearCount) * 100}%`
                                : "0%",
                          }}
                        />

                      </div>

                    </div>
                  ))}

                </div>

              </div>

            </section>

            {/* ================================= */}
            {/* TOP 5 楽曲 */}
            {/* ================================= */}

            <section className="mt-8">

              <div className="mb-3 flex items-center gap-2">

                <Music2
                  size={16}
                  className="text-[#14526B]"
                />

                <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-400">
                  TOP 5 SONGS
                </p>

              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

                {topFiveSongs.map(([song, count], index) => (
                  <Link
                    key={song}
                    href={`/songs/${encodeURIComponent(song)}`}
                    className="flex items-center border-b border-zinc-100 px-4 py-4 transition hover:bg-zinc-50 last:border-b-0"
                  >

                    {/* 順位 */}
                    <div className="w-10 shrink-0">

                      <span
                        className={`text-[13px] font-black ${
                          index === 0
                            ? "text-[#14526B]"
                            : "text-zinc-300"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                    </div>

                    {/* 曲名 */}
                    <div className="min-w-0 flex-1">

                      <p className="truncate text-[14px] font-bold text-[#14526B]">
                        {song}
                      </p>

                    </div>

                    {/* 回数 */}
                    <div className="ml-3 shrink-0">

                      <span className="text-[13px] font-bold text-[#14526B]">
                        {count}
                      </span>

                      <span className="ml-1 text-[11px] text-zinc-400">
                        回
                      </span>

                    </div>

                    <span className="ml-3 text-[12px] text-zinc-300">
                      →
                    </span>

                  </Link>
                ))}

              </div>

            </section>

            {/* ================================= */}
            {/* 会場ランキング */}
            {/* ================================= */}

            <section className="mt-8">

              <div className="mb-3 flex items-center gap-2">

                <Building2
                  size={16}
                  className="text-[#14526B]"
                />

                <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-400">
                  VENUE RANKING
                </p>

              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

                {venueRanking.map(([venue, count], index) => (
                  <div
                    key={venue}
                    className="flex items-center border-b border-zinc-100 px-4 py-4 last:border-b-0"
                  >

                    {/* 順位 */}
                    <span
                      className={`w-10 shrink-0 text-[13px] font-black ${
                        index === 0
                          ? "text-[#14526B]"
                          : "text-zinc-300"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* 会場 */}
                    <span className="min-w-0 flex-1 break-words text-[14px] font-semibold text-[#14526B]">
                      {venue}
                    </span>

                    {/* 回数 */}
                    <div className="ml-3 shrink-0">

                      <span className="text-[13px] font-bold text-[#14526B]">
                        {count}
                      </span>

                      <span className="ml-1 text-[11px] text-zinc-400">
                        回
                      </span>

                    </div>

                  </div>
                ))}

              </div>

            </section>

            {/* ================================= */}
            {/* 都市ランキング */}
            {/* ================================= */}

            <section className="mt-8">

              <div className="mb-3 flex items-center gap-2">

                <MapPin
                  size={16}
                  className="text-[#14526B]"
                />

                <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-400">
                  CITY RANKING
                </p>

              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

                {cityRanking.map(([city, count], index) => (
                  <div
                    key={city}
                    className="flex items-center border-b border-zinc-100 px-4 py-4 last:border-b-0"
                  >

                    {/* 順位 */}
                    <span
                      className={`w-10 shrink-0 text-[13px] font-black ${
                        index === 0
                          ? "text-[#14526B]"
                          : "text-zinc-300"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* 都市 */}
                    <span className="min-w-0 flex-1 text-[14px] font-semibold text-[#14526B]">
                      {city}
                    </span>

                    {/* 回数 */}
                    <div className="ml-3 shrink-0">

                      <span className="text-[13px] font-bold text-[#14526B]">
                        {count}
                      </span>

                      <span className="ml-1 text-[11px] text-zinc-400">
                        回
                      </span>

                    </div>

                  </div>
                ))}

              </div>

            </section>

          </>
        )}

      </div>
    </main>
  );
}