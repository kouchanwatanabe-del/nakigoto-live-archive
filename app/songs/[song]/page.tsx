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
          <h1 className="mt-4 text-[19px] font-bold leading-[1.3] text-[#14526B] sm:text-[24px]">
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

          <div className="mt-4 -mx-4 border-y border-zinc-200 bg-white sm:-mx-6">
  {playedLives.map((live, index) => (
    <Link
      key={live.id}
      href={`/live/${live.id}`}
      className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 sm:px-6 ${
        index !== playedLives.length - 1
          ? "border-b border-zinc-200"
          : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#14526B]">
          {live.date}
        </p>

        <h3 className="mt-1 font-bold leading-[1.4] text-[#14526B]">
          {live.title}
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          <span className="font-medium text-[#14526B]">
            {live.city}
          </span>

          <span className="mx-1.5 text-zinc-300">｜</span>

          {live.venue}
        </p>
      </div>

      <span className="shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5">
        ›
      </span>
    </Link>
  ))}
</div>
        </section>

      </div>
    </main>
  );
}