import Link from "next/link";
import { lives } from "../data/lives";

type Live = (typeof lives)[number];

// 日付が新しい順に並べて、最新3件だけ取得
const latestLives = [...lives]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 3);

export default function Home() {
  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 pt-14">

        {/* ヘッダー */}
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10">

          {/* 左側 */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
              UNOFFICIAL 
              LIVE ARCHIVE
            </p>

            <h1 className="mt-3 text-5xl font-black tracking-tight text-[#14526B]">
              なきごと
            </h1>

            <p className="mt-3 text-base leading-7 text-zinc-500">
              過去ライブ・セットリスト・ツアー記録
            </p>
          </div>

          {/* 掲載ライブ数 */}
          <div className="shrink-0 sm:text-right">
            <p className="text-xs font-medium tracking-[0.15em] text-zinc-400">
              掲載ライブ
            </p>

            <div className="mt-2 flex items-end gap-2 sm:justify-end">
              <span className="text-5xl font-black leading-none text-[#14526B]">
                {lives.length}
              </span>

              <span className="pb-1 text-sm font-medium text-zinc-500">
                公演
              </span>
            </div>
          </div>

        </div>

        {/* 最新ライブ */}
        <section className="mt-14">

          <div className="mb-5 flex items-center justify-between text-[#14526B]">
            <h2 className="text-2xl font-bold">
              最新ライブ
            </h2>

            {/* 全ライブ検索ページへ */}
            <Link
              href="/lives"
              className="text-sm font-medium text-[#14526B] hover:underline"
            >
              すべて見る →
            </Link>
          </div>

          <div className="space-y-4">
            {latestLives.map((live: Live) => (

              <Link
                key={live.id}
                href={`/live/${live.id}`}
                className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#14526B] hover:shadow-md"
              >

                {/* 日付 */}
                <p className="text-sm font-medium text-[#14526B]">
                  {live.date}
                </p>

                {/* 公演名 */}
                <h3 className="mt-2 text-xl font-bold leading-snug text-[#14526B]">
                  {live.title}
                </h3>

                {/* 会場 */}
                <p className="mt-3 text-zinc-500">
                  {live.venue}
                </p>

                <div className="mt-4 flex items-center justify-between">

                  {/* ツアー */}
                  <span className="rounded-full bg-[#14526B]/10 px-3 py-1 text-xs font-medium text-[#14526B]">
                    {live.tour}
                  </span>

                  <span className="text-sm text-zinc-400">
                    →
                  </span>

                </div>

              </Link>

            ))}
          </div>

        </section>

      </div>
    </main>
  );
}