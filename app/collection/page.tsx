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

  // 参戦したライブだけ取得
  const attendedLives = lives
    .filter((live: Live) =>
      attendedIds.includes(live.id)
    )
    .sort((a, b) =>
      b.date.localeCompare(a.date)
    );

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

        {/* 参戦数 */}
        <section className="mt-8">
          <p className="text-[11px] font-medium tracking-[0.15em] text-zinc-400">
            参戦ライブ
          </p>

          <div className="mt-1 flex items-end gap-2">
            <span className="text-[40px] font-black leading-none text-[#14526B]">
              {attendedLives.length}
            </span>

            <span className="pb-0.5 text-[13px] text-zinc-500">
              公演
            </span>
          </div>
        </section>

        {/* 読み込み中 */}
        {!loaded && (
          <div className="mt-8 text-[13px] text-zinc-400">
            読み込み中...
          </div>
        )}

        {/* 参戦ライブがない場合 */}
        {loaded && attendedLives.length === 0 && (
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

        {/* 参戦ライブ一覧 */}
        {loaded && attendedLives.length > 0 && (
          <section className="mt-8">

            <div className="mb-3">
              <h2 className="text-[20px] font-bold text-[#14526B]">
                参戦したライブ
              </h2>
            </div>

            <div className="space-y-2.5">
              {attendedLives.map((live: Live) => (
                <Link
                  key={live.id}
                  href={`/live/${live.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-[#14526B] hover:shadow-md"
                >
                  {/* 日付 */}
                  <p className="text-[12px] font-medium text-[#14526B]">
                    {live.date}
                  </p>

                  {/* 公演名 */}
                  <h3 className="mt-1 text-[16px] font-bold leading-snug text-zinc-900">
                    {live.title}
                  </h3>

                  {/* 都市・会場 */}
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

      </div>
    </main>
  );
}