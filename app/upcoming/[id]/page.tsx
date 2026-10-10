import Link from "next/link";
import { notFound } from "next/navigation";
import { upcomingLives } from "../../../data/upcomingLives";

export default async function UpcomingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const live = upcomingLives.find(
    (item) => item.id === decodeURIComponent(id)
  );

  if (!live) notFound();

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">

        {/* 戻る */}
        <Link
          href="/lives"
          className="text-3xl text-[#14526B]"
          aria-label="LIVEに戻る"
        >
          ‹
        </Link>

        {/* 公演情報 */}
        <p className="mt-5 text-xs font-bold tracking-wider text-[#14526B]">
          UPCOMING LIVE
        </p>

        <p className="mt-3 text-sm font-bold text-[#14526B]">
          {live.date}
        </p>

        <h1 className="mt-2 text-xl font-bold leading-relaxed text-[#14526B]">
          {live.title}
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          {live.city} ｜ {live.venue}
        </p>

        {live.tour && (
          <p className="mt-3 text-sm text-zinc-600">
            {live.tour}
          </p>
        )}

        {/* 対バン */}
        {live.artists && live.artists.length > 0 && (
          <p className="mt-4 text-sm text-zinc-600">
            出演：{live.artists.join(" / ")}
          </p>
        )}

        {/* メモ */}
        {live.memo && (
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-600">
            {live.memo}
          </p>
        )}

        {/* ================================= */}
        {/* ACCESS */}
        {/* ================================= */}

        {(live.address || live.mapUrl) && (
          <section className="mt-7 border-t border-zinc-200 pt-5">

            <h2 className="text-sm font-bold text-[#14526B]">
              ACCESS
            </h2>

            {live.address && (
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {live.address}
              </p>
            )}

            {live.mapUrl && (
              <a
                href={live.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#14526B] transition-opacity hover:opacity-60"
              >
                <span>Google Mapsで見る</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}

          </section>
        )}

        {/* セットリスト案内 */}
        <p className="mt-8 border-t border-zinc-200 pt-5 text-xs text-zinc-400">
          セットリストは終演後に掲載します。
        </p>

      </div>
    </main>
  );
}