"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { lives } from "../../data/lives";

type Live = (typeof lives)[number];

export default function CollectionPage() {
  const [attendedIds, setAttendedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

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

  // 参戦したライブ
  const attendedLives = lives
    .filter((live: Live) =>
      attendedIds.includes(live.id)
    )
    .sort((a, b) =>
      b.date.localeCompare(a.date)
    );

  // サイトに登録されている全楽曲
  const allSongs = [
    ...new Set(
      lives.flatMap((live: Live) => [
        ...live.setlist,
        ...(live.encore ?? []),
      ])
    ),
  ];

  // 参戦ライブで聴いた曲と回数
  const heardSongCounts: Record<string, number> = {};

  attendedLives.forEach((live) => {
    // 同じ公演で同じ曲が2回あっても1回としてカウント
    const songs = [
      ...new Set([
        ...live.setlist,
        ...(live.encore ?? []),
      ]),
    ];

    songs.forEach((song) => {
      heardSongCounts[song] =
        (heardSongCounts[song] ?? 0) + 1;
    });
  });

  // 聴いた曲
  const heardSongs = Object.entries(heardSongCounts)
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0].localeCompare(b[0], "ja");
    });

  // まだ聴けていない曲
  const unheardSongs = allSongs
    .filter((song) => !heardSongCounts[song])
    .sort((a, b) => a.localeCompare(b, "ja"));

  // 聴けた割合
  const completion =
    allSongs.length > 0
      ? Math.round(
          (heardSongs.length / allSongs.length) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* ヘッダー */}
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-400">
            MY LIVE ARCHIVE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#14526B]">
            COLLECTION
          </h1>

          <p className="mt-2 text-[14px] text-zinc-500">
            あなたの参戦記録
          </p>
        </div>

        {!loaded && (
          <div className="mt-8 text-[13px] text-zinc-400">
            読み込み中...
          </div>
        )}

        {loaded && (
          <>
            {/* サマリー */}
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

            {/* 達成率 */}
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

            {/* 参戦記録なし */}
            {attendedLives.length === 0 && (
              <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-8 text-center">
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

            {/* 参戦ライブ */}
            {attendedLives.length > 0 && (
              <section className="mt-10">

                <h2 className="mb-3 text-[20px] font-bold text-[#14526B]">
                  参戦したライブ
                </h2>

                <div className="space-y-2.5">
                  {attendedLives.map((live: Live) => (
                    <Link
                      key={live.id}
                      href={`/live/${live.id}`}
                      className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-[#14526B] hover:shadow-md"
                    >
                      <p className="text-[12px] font-medium text-[#14526B]">
                        {live.date}
                      </p>

                      <h3 className="mt-1 text-[16px] font-bold leading-snug text-zinc-900">
                        {live.title}
                      </h3>

                      <p className="mt-1.5 truncate text-[12px] text-zinc-500">
                        <span className="font-medium text-[#14526B]">
                          {live.city}
                        </span>

                        <span className="mx-2 text-zinc-300">
                          ｜
                        </span>

                        {live.venue}
                      </p>
                    </Link>
                  ))}
                </div>

              </section>
            )}

            {/* 聴いた曲 */}
            {heardSongs.length > 0 && (
              <section className="mt-10">

                <div className="mb-3 flex items-end justify-between">
                  <h2 className="text-[20px] font-bold text-[#14526B]">
                    聴いた曲
                  </h2>

                  <span className="text-[12px] text-zinc-400">
                    {heardSongs.length}曲
                  </span>
                </div>

                <div className="space-y-2">
                  {heardSongs.map(([song, count]) => (
                    <Link
                      key={song}
                      href={`/songs/${encodeURIComponent(song)}`}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-[#14526B]"
                    >
                      <span className="min-w-0 truncate text-[14px] font-semibold text-zinc-900">
                        {song}
                      </span>

                      <div className="ml-3 flex shrink-0 items-center gap-3">
                        <span className="text-[12px] font-medium text-[#14526B]">
                          {count}回
                        </span>

                        <span className="text-[12px] text-zinc-300">
                          →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

              </section>
            )}

            {/* まだ聴けていない曲 */}
            <section className="mt-10">

              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-[20px] font-bold text-[#14526B]">
                  まだ聴けていない曲
                </h2>

                <span className="text-[12px] text-zinc-400">
                  {unheardSongs.length}曲
                </span>
              </div>

              {unheardSongs.length > 0 ? (
                <div className="space-y-2">
                  {unheardSongs.map((song) => (
                    <Link
                      key={song}
                      href={`/songs/${encodeURIComponent(song)}`}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-[#14526B]"
                    >
                      <span className="min-w-0 truncate text-[14px] font-medium text-zinc-600">
                        {song}
                      </span>

                      <span className="ml-3 text-[12px] text-zinc-300">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-[#14526B]/10 px-5 py-6 text-center">
                  <p className="font-bold text-[#14526B]">
                    全曲コンプリート！
                  </p>
                </div>
              )}

            </section>
          </>
        )}

      </div>
    </main>
  );
}