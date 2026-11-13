"use client";

import BackButton from "../../../components/BackButton";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllUpcomingLives } from "../../../lib/upcoming-data";
import type { UpcomingLive } from "../../../data/upcomingLives";

type LoadState = "loading" | "ready" | "not-found" | "error";

export default function UpcomingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [live, setLive] = useState<UpcomingLive | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");

    getAllUpcomingLives()
      .then((items) => {
        if (!active) return;
        const found = items.find((item) => item.id === id) ?? null;
        setLive(found);
        setStatus(found ? "ready" : "not-found");
      })
      .catch((error) => {
        console.error("UPCOMING LIVEの取得に失敗しました", error);
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [id, retryCount]);

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        <BackButton />

        {status === "loading" && (
          <p className="mt-8 text-sm text-zinc-500" role="status">
            公演情報を読み込み中...
          </p>
        )}

        {status === "error" && (
          <div className="mt-8">
            <p role="alert" className="text-sm text-red-600">
              公演情報の取得に失敗しました。
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-3 rounded-lg border border-[#14526B] px-4 py-2 text-sm font-semibold text-[#14526B]"
            >
              再読み込み
            </button>
          </div>
        )}

        {status === "not-found" && (
          <p className="mt-8 text-sm text-zinc-500">公演が見つかりませんでした。</p>
        )}

        {status === "ready" && live && (
          <>
            <p className="mt-3 text-xs font-bold tracking-wider text-[#14526B]">
              UPCOMING LIVE
            </p>

            <p className="mt-4 text-[13px] font-bold text-[#14526B]">
              {live.date}
            </p>

            <h1 className="mt-1 text-2xl font-bold leading-snug text-[#14526B]">
              {live.title}
            </h1>

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
              <span className="font-semibold text-[#14526B]">{live.city}</span>
              <span className="mx-1 text-zinc-300">|</span>
              <span>{live.venue}</span>
            </div>

            {live.tour && (
              <p className="mt-2 text-xs text-zinc-500">{live.tour}</p>
            )}

            {(live.open || live.start) && (
              <div className="mt-3 flex items-center gap-5 text-xs text-zinc-600">
                {live.open && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#14526B]">OPEN</span>
                    <span>{live.open}</span>
                  </div>
                )}
                {live.start && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#14526B]">START</span>
                    <span>{live.start}</span>
                  </div>
                )}
              </div>
            )}

            {live.artists && live.artists.length > 0 && (
              <p className="mt-2 text-xs text-zinc-500">
                <span className="mr-2 font-bold text-[#14526B]">w /</span>
                {live.artists.join(" , ")}
              </p>
            )}

            {live.memo && (
              <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-zinc-600">
                {live.memo}
              </p>
            )}

            {live.address && (
              <section className="mt-5 border-t border-zinc-200 pt-4">
                <h2 className="text-xs font-bold text-[#14526B]">ACCESS</h2>
                <p className="mt-2 text-xs leading-6 text-zinc-600">
                  {live.address}
                </p>
                <a
                  href={
                    live.mapUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${live.venue} ${live.address}`)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#14526B] hover:opacity-60"
                >
                  Google Mapsで見る
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                    <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1 2-2V5a2 2 0 0 1 2-2h6" />
                  </svg>
                </a>
              </section>
            )}

            <p className="mt-5 border-t border-zinc-200 pt-4 text-xs text-zinc-400">
              セットリストは終演後に掲載します。
            </p>
          </>
        )}
      </div>
    </main>
  );
}
