import Link from "next/link";
import { lives } from "../../data/lives";

export default function SongsPage() {
  // 全ライブのセットリストから曲を集める
  const allSongs = lives.flatMap((live) => [
    ...live.setlist,
    ...(live.encore ?? []),
  ]);

  // 重複を削除して五十音順に並べる
  const songs = [...new Set(allSongs)].sort((a, b) =>
    a.localeCompare(b, "ja")
  );

  // その曲が演奏されたライブ数
  const getPlayCount = (songName: string) => {
    return lives.filter((live) => {
      const playedSongs = [
        ...live.setlist,
        ...(live.encore ?? []),
      ];

      return playedSongs.includes(songName);
    }).length;
  };

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* ヘッダー */}
        <h1 className="text-3xl font-bold text-[#14526B]">
          MUSIC
        </h1>

        <p className="mt-2 text-zinc-500">
          楽曲一覧
        </p>

        {/* 曲数 */}
        <div className="mt-8">
          <p className="text-sm text-zinc-500">
            {songs.length}曲
          </p>
        </div>

        {/* 曲一覧 */}
        <div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">

          {songs.map((song) => (
            <Link
              key={song}
              href={`/songs/${encodeURIComponent(song)}`}
              className="flex items-center justify-between px-2 py-5 transition hover:bg-zinc-50"
            >
              <div>
                <p className="font-semibold text-zinc-900">
                  {song}
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  {getPlayCount(song)}公演
                </p>
              </div>

              <span className="text-zinc-400">
                →
              </span>
            </Link>
          ))}

        </div>

      </div>
    </main>
  );
}