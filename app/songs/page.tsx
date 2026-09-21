import Link from "next/link";
import { lives } from "../../data/lives";

export default function SongsPage() {

  // 全ライブから全曲を取得
  const allSongs = lives.flatMap((live) => [
    ...live.setlist,
    ...(live.encore ?? []),
  ]);

  // 重複を削除
  const uniqueSongs = [...new Set(allSongs)];

  // 曲ごとの演奏公演数を取得
  const getPlayCount = (songName: string) => {
    return lives.filter((live) => {
      const playedSongs = [
        ...live.setlist,
        ...(live.encore ?? []),
      ];

      return playedSongs.includes(songName);
    }).length;
  };

  // 演奏公演数が多い順に並べる
  const songs = uniqueSongs
    .map((song) => ({
      name: song,
      count: getPlayCount(song),
    }))
    .sort((a, b) => {
      // 演奏回数が多い順
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      // 同じ回数なら五十音順
      return a.name.localeCompare(b.name, "ja");
    });

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-[#14526B]">
            SONGS
          </h1>

          <p className="mt-2 text-[14px] text-zinc-500">
            楽曲一覧
          </p>
        </div>

        {/* 曲数 */}
        <div className="mt-7 flex items-end justify-between">
          <p className="text-[13px] text-zinc-400">
            全 {songs.length} 曲
          </p>

          <p className="text-[11px] font-medium text-zinc-400">
            演奏回数順
          </p>
        </div>

        {/* 楽曲一覧 */}
        <div className="mt-3 space-y-2.5">

          {songs.map((song, index) => (
            <Link
              key={song.name}
              href={`/songs/${encodeURIComponent(song.name)}`}
              className="flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:border-[#14526B] hover:shadow-md"
            >

              {/* 順位 */}
              <span className="w-10 shrink-0 text-[12px] font-bold text-zinc-300">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* 曲名 */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-bold text-[#14526B]">
                  {song.name}
                </p>

                <p className="mt-1 text-[11px] text-zinc-400">
                  {song.count}公演で演奏
                </p>
              </div>

              {/* 矢印 */}
              <span className="ml-3 shrink-0 text-[13px] text-zinc-300">
                →
              </span>

            </Link>
          ))}

        </div>

      </div>
    </main>
  );
}