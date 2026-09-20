import Link from "next/link";
import { lives } from "../../../data/lives";

type LiveId = (typeof lives)[number]["id"];

export default async function LivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const live = lives.find(
    (live) => live.id === (id as LiveId)
  );

  if (!live) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-900">
        ライブが見つかりません
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-12">

        {/* ライブ検索画面に戻る */}
        <Link
          href="/lives"
          className="text-[#14526B] hover:underline"
        >
          ← 戻る
        </Link>

        {/* ライブ情報 */}
        <p className="mt-8 text-sm text-zinc-500">
          {live.date}
        </p>

        {/* 公演名 */}
        <h1 className="mt-2 text-4xl font-bold text-[#14526B]">
          {live.title}
        </h1>

        <p className="mt-3 text-zinc-500">
          {live.venue}
        </p>

        {/* 本編 */}
        <section className="mt-10">

          {/* SET LIST */}
          <h2 className="mb-5 text-xl font-bold text-[#14526B]">
            SET LIST
          </h2>

          <div className="space-y-3">
            {live.setlist.map((song, i) => (
              <div
                key={song}
                className="flex items-center rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <span className="w-10 text-sm font-semibold text-[#14526B]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="font-medium text-zinc-900">
                  {song}
                </span>
              </div>
            ))}
          </div>

        </section>

        {/* アンコール */}
        {live.encore && live.encore.length > 0 && (
          <section className="mt-10">

            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-300" />

              <span className="text-xs font-bold tracking-[0.3em] text-zinc-500">
                ENCORE
              </span>

              <div className="h-px flex-1 bg-zinc-300" />
            </div>

            <div className="space-y-3">
              {live.encore.map((song, i) => (
                <div
                  key={song}
                  className="flex items-center rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <span className="w-10 text-sm font-semibold text-[#14526B]">
                    {String(
                      live.setlist.length + i + 1
                    ).padStart(2, "0")}
                  </span>

                  <span className="font-medium text-zinc-900">
                    {song}
                  </span>
                </div>
              ))}
            </div>

          </section>
        )}

      </div>
    </main>
  );
}