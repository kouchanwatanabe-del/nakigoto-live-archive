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
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">

        {/* 戻る */}
        <Link
          href="/lives"
          className="text-3xl text-[#14526B]"
          aria-label="LIVEに戻る"
        >
          ‹
        </Link>

        {/* UPCOMING LIVE */}
        <p className="mt-3 text-xs font-bold tracking-wider text-[#14526B]">
          UPCOMING LIVE
        </p>

        {/* 日付 */}
        <p className="mt-4 text-[13px] font-bold text-[#14526B]">
          {live.date}
        </p>

        {/* 公演名 */}
        <h1 className="mt-1 text-2xl font-bold leading-snug text-[#14526B]">
          {live.title}
        </h1>

        {/* 会場 */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>

          <span className="font-semibold text-[#14526B]">
            {live.city}
          </span>

          <span className="mx-1 text-zinc-300">|</span>

          <span>{live.venue}</span>
        </div>

        {/* ツアー */}
        {live.tour && (
          <p className="mt-2 text-xs text-zinc-500">
            {live.tour}
          </p>
        )}

        {/* 対バン */}
        {live.artists && live.artists.length > 0 && (
          <p className="mt-2 text-xs text-zinc-500">
            <span className="mr-2 font-bold text-[#14526B]">
              w /
            </span>
            {live.artists.join(" , ")}
          </p>
        )}

        {/* メモ */}
        {live.memo && (
          <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-zinc-600">
            {live.memo}
          </p>
        )}

        {/* ACCESS */}
        {(live.address || live.mapUrl) && (
          <section className="mt-5 border-t border-zinc-200 pt-4">

            <h2 className="text-xs font-bold text-[#14526B]">
              ACCESS
            </h2>

            {live.address && (
              <p className="mt-2 text-xs leading-6 text-zinc-600">
                {live.address}
              </p>
            )}

            {live.mapUrl && (
              <a
                href={live.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#14526B] hover:opacity-60"
              >
                Google Mapsで見る
                <svg
  width="17"
  height="17"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
  <circle cx="12" cy="12" r="9" />
  <path d="M8 16 16 8" />
  <path d="M9 8h7v7" />
</svg>
              </a>
            )}

          </section>
        )}

        {/* セットリスト案内 */}
        <p className="mt-5 border-t border-zinc-200 pt-4 text-xs text-zinc-400">
          セットリストは終演後に掲載します。
        </p>

      </div>
    </main>
  );
}