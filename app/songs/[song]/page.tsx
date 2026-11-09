import { getAllLives } from "../../../lib/live-data";
import SongLiveList from "../../../components/SongLiveList";
import BackButton from "../../../components/BackButton";

export default async function SongPage({
  params,
}: {
  params: Promise<{ song: string }>;
}) {
  
const { song } = await params;
const songName = decodeURIComponent(song);

let lives;

try {
  lives = await getAllLives();
} catch (error) {
  console.error("ライブ情報の取得に失敗しました", error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-zinc-500">
      ライブ情報を取得できませんでした
    </main>
  );
}


  // ========================================
  // この曲が演奏されたライブ
  // 弾き語りなど除外指定されたライブは含めない
  // ========================================

  const playedLives = lives.filter(
    (live) => {
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

      return songs.includes(songName);
    }
  );

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-9">

        {/* ================================= */}
        {/* 戻る */}
        {/* ================================= */}

        <BackButton />

        {/* ================================= */}
        {/* 曲情報 */}
        {/* ================================= */}

        <div className="mt-5">

          <p className="text-[12px] font-semibold tracking-[0.03em] text-[#14526B]">
            SONG
          </p>

          <h1 className="mt-1.5 text-[19px] font-bold leading-[1.35] text-[#14526B] sm:text-[24px]">
            {songName}
          </h1>

          <p className="mt-2 text-[12px] text-zinc-500 sm:text-[13px]">
            {playedLives.length}
            公演で演奏
          </p>

        </div>

        {/* ================================= */}
        {/* 演奏ライブ */}
        {/* ================================= */}

        <section className="mt-7">
          <SongLiveList
            playedLives={playedLives}
          />
        </section>

      </div>
    </main>
  );
}