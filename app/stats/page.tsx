"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Building2,
  Trophy,
} from "lucide-react";

import { lives } from "../../data/lives";

type Live = (typeof lives)[number];

export default function StatsPage() {
  const [attendedIds, setAttendedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

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

  // 参戦したライブ
  const attendedLives = useMemo(() => {
    return lives
      .filter((live: Live) =>
        attendedIds.includes(live.id)
      )
      .sort((a, b) =>
        b.date.localeCompare(a.date)
      );
  }, [attendedIds]);

  // 聴いた曲の回数
  const songCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    attendedLives.forEach((live) => {
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

  // 一番聴いた曲
  const mostPlayedSong =
    Object.entries(songCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

  // 会場ごとの参戦回数
  const venueCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    attendedLives.forEach((live) => {
      counts[live.venue] =
        (counts[live.venue] ?? 0) + 1;
    });

    return counts;
  }, [attendedLives]);

  // 一番行った会場
  const topVenue =
    Object.entries(venueCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

  // 都市ごとの参戦回数
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    attendedLives.forEach((live) => {
      counts[live.city] =
        (counts[live.city] ?? 0) + 1;
    });

    return counts;
  }, [attendedLives]);

  // 一番行った都市
  const topCity =
    Object.entries(cityCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

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

        {/* 戻る */}
        <Link
          href="/collection"
          className="text-[13px] font-medium text-[#14526B]"
        >
          ← COLLECTION
        </Link>

        {/* ヘッダー */}
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

        {attendedLives.length === 0 ? (
          /* 参戦記録なし */
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
            {/* 一番聴いた曲 */}
            {mostPlayedSong && (
              <section className="mt-8">

                <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-zinc-400">
                  MOST PLAYED
                </p>

                <Link
                  href={`/songs/${encodeURIComponent(
                    mostPlayedSong[0]
                  )}`}
                  className="flex items-center rounded-2xl bg-[#14526B] p-5 text-white shadow-sm"
                >

                  <div className="mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <Trophy size={21} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-[11px] text-white/60">
                      一番よく聴いた曲
                    </p>

                    <p className="mt-1 truncate text-[19px] font-bold">
                      {mostPlayedSong[0]}
                    </p>

                  </div>

                  <div className="ml-3 text-right">

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

            {/* 会場・都市 */}
            <section className="mt-8">

              <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-zinc-400">
                FAVORITES
              </p>

              <div className="grid grid-cols-2 gap-3">

                {/* 一番行った会場 */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">

                  <Building2
                    size={19}
                    className="text-[#14526B]"
                  />

                  <p className="mt-3 text-[11px] text-zinc-400">
                    一番行った会場
                  </p>

                  <p className="mt-1 break-words text-[14px] font-bold text-zinc-900">
                    {topVenue?.[0]}
                  </p>

                  <p className="mt-2 text-[12px] font-bold text-[#14526B]">
                    {topVenue?.[1]}回
                  </p>

                </div>

                {/* 一番行った都市 */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">

                  <MapPin
                    size={19}
                    className="text-[#14526B]"
                  />

                  <p className="mt-3 text-[11px] text-zinc-400">
                    一番行った都市
                  </p>

                  <p className="mt-1 text-[14px] font-bold text-zinc-900">
                    {topCity?.[0]}
                  </p>

                  <p className="mt-2 text-[12px] font-bold text-[#14526B]">
                    {topCity?.[1]}回
                  </p>

                </div>

              </div>

            </section>
          </>
        )}

      </div>
    </main>
  );
}