import Link from "next/link";
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
  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">

      {/* ================================= */}
      {/* 固定ヘッダー */}
      {/* ================================= */}



      {/* ================================= */}
      {/* HOMEコンテンツ */}
      {/* ================================= */}

      <div className="mx-auto max-w-3xl px-6 pt-8">

        {/* 最新ライブ */}
        <section>

          <div className="mb-3.5 flex items-center justify-between text-[#14526B]">
            <h2 className="text-[22px] font-bold">
              最新ライブ
            </h2>

            <Link
              href="/lives"
              className="text-[13px] font-medium text-[#14526B] hover:underline"
            >
              すべて見る →
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

                {/* ツアー・矢印 */}
                <div className="mt-1.5 flex items-center justify-between">

                  {live.tour ? (
                    <span className="min-w-0 truncate rounded-full bg-[#14526B]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#14526B]">
                      {live.tour}
                    </span>
                  ) : (
                    <span />
                  )}

                  <span className="ml-3 shrink-0 text-[12px] text-zinc-400">
                    →
                  </span>

                </div>

              </Link>
            ))}
          </div>

        </section>

        {/* 頻出曲 */}
        <section className="mt-11">

          <div className="mb-3.5 flex items-center justify-between">

            <h2 className="text-[22px] font-bold text-[#14526B]">
              頻出曲
            </h2>

            <Link
              href="/songs"
              className="text-[13px] font-medium text-[#14526B] hover:underline"
            >
              すべての曲 →
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
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-zinc-900">
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

      </div>

    </main>
  );
}