import Link from "next/link";
import { lives } from "../../../data/lives";

export default async function SongPage({
  params,
}: {
  params: Promise<{ song: string }>;
}) {
  const { song } = await params;

  const songName = decodeURIComponent(song);

  // この曲を演奏したライブを取得
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

        {/* 曲名 */}
        <div className="mt-8 text-[#14526B]">
          

          <h1 className="mt-2 text-4xl font-bold text-[#14526B]">
            {songName}
          </h1>

          <p className="mt-3 text-zinc-500 text-[#14526B]">
            全{playedLives.length}公演
          </p>
        </div>

        {/* ライブ一覧 */}
        <section className="mt-10">

          <h2 className="text-xl font-bold text-[#14526B]">
            演奏したライブ
          </h2>

          <div className="mt-5 space-y-4">

            {playedLives.map((live) => (
              <Link
                key={live.id}
                href={`/live/${live.id}`}
                className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#14526B] hover:shadow-md"
              >

                <p className="text-sm font-medium text-[#14526B]">
                  {live.date}
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  {live.title}
                </h3>

                <p className="mt-2 text-zinc-500">
                  {live.venue}
                </p>

                <div className="mt-4 flex items-center justify-between">

                  <span className="rounded-full bg-[#14526B]/10 px-3 py-1 text-xs font-medium text-[#14526B]">
                    {live.tour}
                  </span>

                  <span className="text-zinc-400">
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