import Link from "next/link";
import { notFound } from "next/navigation";
import { upcomingLives } from "../../../data/upcomingLives";

export default async function UpcomingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const live = upcomingLives.find((item) => item.id === decodeURIComponent(id));
  if (!live) notFound();
  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
        <Link href="/lives" className="text-3xl text-[#14526B]" aria-label="LIVEに戻る">‹</Link>
        <p className="mt-5 text-xs font-bold tracking-wider text-[#14526B]">UPCOMING LIVE</p>
        <p className="mt-3 text-sm font-bold text-[#14526B]">{live.date}</p>
        <h1 className="mt-2 text-xl font-bold leading-relaxed text-[#14526B]">{live.title}</h1>
        <p className="mt-3 text-sm text-zinc-500">{live.city} ｜ {live.venue}</p>
        {live.tour && <p className="mt-3 text-sm text-zinc-600">{live.tour}</p>}
        {live.artists && live.artists.length > 0 && <p className="mt-4 text-sm text-zinc-600">出演：{live.artists.join(" / ")}</p>}
        {live.memo && <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-600">{live.memo}</p>}
        <p className="mt-8 border-t border-zinc-200 pt-5 text-xs text-zinc-400">セットリストは終演後に掲載します。</p>
      </div>
    </main>
  );
}
