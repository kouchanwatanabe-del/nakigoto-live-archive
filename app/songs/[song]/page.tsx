import Link from "next/link";
import { lives } from "../../../data/lives";
import SongLiveList from "../../../components/SongLiveList";
import BackButton from "../../../components/BackButton";

export default async function SongPage({
  params,
}: {
  params: Promise<{ song: string }>;
}) {
  const { song } = await params;
  const songName = decodeURIComponent(song);

  // ========================================
  // この曲が演奏されたライブ
  // 弾き語りなど除外指定されたライブは含めない
  // ========================================

  const playedLives = lives.filter(
    (live) => {
      // SONGSの演奏履歴から除外
      if (
        live.excludeFromSongHistory ===
        true
      ) {
        return false;
      }

      const songs = [
        ...live.setlist,
        ...(live.encore ?? []),
      ];

      return songs.includes(
        songName
      );
    }
  );

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* ================================= */}
        {/* 戻る */}
        {/* ================================= */}

        <BackButton />
        
        {/* ================================= */}
        {/* 曲情報 */}
        {/* ================================= */}

        <div className="mt-8">
          <p className="text-sm font-medium text-[#14526B]">
            SONG
          </p>

          {/* 曲名 */}

          <h1 className="mt-4 text-[19px] font-bold leading-[1.3] text-[#14526B] sm:text-[24px]">
            {songName}
          </h1>

          {/* 演奏回数 */}

          <p className="mt-3 text-sm text-zinc-500">
            {playedLives.length}
            公演で演奏
          </p>
        </div>

        {/* ================================= */}
        {/* 演奏ライブ */}
        {/* ================================= */}

        <section className="mt-9">
          <SongLiveList
            playedLives={
              playedLives
            }
          />
        </section>

      </div>
    </main>
  );
}