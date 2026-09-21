import Link from "next/link";
import { lives } from "../../../data/lives";

export default async function SongPage({
  params,
}: {
  params: Promise<{ song: string }>;
}) {
  const { song } = await params;
  const songName = decodeURIComponent(song);

  // この曲が演奏されたライブ
  const playedLives = lives
    .filter((live) => {
      const songs = [
        ...live.setlist,
        ...(live.encore ?? []),
      ];

      return songs.includes(songName);
    })
    .sort((a, b) =>
      b.date.localeCompare(a.date)
    );

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* 戻る */}
        <Link
          href="/songs"
          className="text-sm font-medium text-[#14526B] hover:underline"
        >
          ← 楽曲一覧
        </Link>

        {/* 曲情報 */}
        <div className="mt-8">

          <p className="text-sm font-medium text-[#14526B]">
            SONG
          </p>

          {/* 曲名 */}
          <h1 className="mt-2 text-3xl font-bold text-[#14526B] sm:text-4xl">
            {songName}
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            {playedLives.length}公演で演奏
          </p>

        </div>

        {/* 演奏ライブ */}
        <section className="mt-9">

          <h2 className="text-lg font-bold text-[#14526B]">
            演奏したライブ
          </h2>

          <div className="mt-4 space-y-2.5">

            {playedLives.map((live) => (
              <Link
                key={live.id}
                href={`/live/${live.id}`}
                className="group flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-[#14526B] hover:shadow-md"
              >

                {/* ライブ情報 */}
                <div className="min-w-0 flex-1">

                  {/* 日付 */}
                  <p className="text-[11px] font-medium text-[#14526B]">
                    {live.date}
                  </p>

                  {/* ライブタイトル */}
                  <h3 className="mt-1 truncate text-[14px] font-bold text-[#14526B]">
                    {live.title}
                  </h3>

                  {/* 会場 */}
                  <p className="mt-1 truncate text-[11px] text-[#14526B]">
                    {live.venue}
                  </p>

                </div>

                {/* 矢印 */}
                <span className="ml-4 shrink-0 text-[13px] text-[#14526B] transition-all group-hover:translate-x-1">
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