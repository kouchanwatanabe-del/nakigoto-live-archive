"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { lives } from "../../data/lives";

type Live = (typeof lives)[number];

export default function LivesPage() {
  const [keyword, setKeyword] = useState("");
  const [year, setYear] = useState("すべて");

  // 登録されている開催年を自動取得
  const years = useMemo(() => {
    const yearList = lives.map((live: Live) =>
      live.date.slice(0, 4)
    );

    return [...new Set(yearList)].sort((a, b) =>
      b.localeCompare(a)
    );
  }, []);

  // 検索・絞り込み
  const filteredLives = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return lives
      .filter((live: Live) => {
        const yearMatch =
          year === "すべて" || live.date.startsWith(year);

        const titleMatch =
          live.title.toLowerCase().includes(q);

        const venueMatch =
          live.venue.toLowerCase().includes(q);

        const tourMatch =
          live.tour.toLowerCase().includes(q);

        const setlistMatch = live.setlist.some(
          (song: string) =>
            song.toLowerCase().includes(q)
        );

        const encoreMatch =
          "encore" in live &&
          Array.isArray(live.encore) &&
          live.encore.some((song: string) =>
            song.toLowerCase().includes(q)
          );

        const keywordMatch =
          q === "" ||
          titleMatch ||
          venueMatch ||
          tourMatch ||
          setlistMatch ||
          encoreMatch;

        return yearMatch && keywordMatch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [keyword, year]);

  return (
    <main className="min-h-screen bg-white pb-36 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        {/* タイトル */}
        <h1 className="text-3xl font-bold text-[#14526B]">
          LIVE
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
          曲名・開催年・都市・公演名で検索できます。
        </p>

        {/* 検索エリア */}
        <section className="mt-6 sm:mt-8">

          {/* 検索ボックス */}
          <div className="relative z-10">
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="曲名・都市・公演名を検索"
              autoComplete="off"
              enterKeyHint="search"
              className="relative z-10 w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-4 pr-12 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-[#14526B] focus:ring-2 focus:ring-[#14526B]/10"
            />

            {/* 入力削除 */}
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-xl text-zinc-400 active:bg-zinc-100"
                aria-label="検索文字を消去"
              >
                ×
              </button>
            )}
          </div>

          {/* 年代フィルター */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setYear("すべて")}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                year === "すべて"
                  ? "bg-[#14526B] text-white"
                  : "border border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              すべて
            </button>

            {years.map((y: string) => (
              <button
                type="button"
                key={y}
                onClick={() => setYear(y)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  year === y
                    ? "bg-[#14526B] text-white"
                    : "border border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

        </section>

        {/* 件数 */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="shrink-0 text-sm text-zinc-500">
            {filteredLives.length}件
          </p>

          {(keyword || year !== "すべて") && (
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setYear("すべて");
              }}
              className="text-sm font-medium text-[#14526B]"
            >
              条件をリセット
            </button>
          )}
        </div>

        {/* ライブ一覧 */}
        <div className="mt-4 space-y-4">
          {filteredLives.map((live: Live) => (
            <Link
              key={live.id}
              href={`/live/${live.id}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition active:bg-zinc-50 sm:p-5 sm:hover:border-[#14526B] sm:hover:shadow-md"
            >
              <div className="min-w-0">

                <p className="text-sm font-semibold text-[#14526B]">
                  {live.date}
                </p>

                <h2 className="mt-2 break-words text-lg font-bold leading-snug text-[#14526B] sm:text-xl">
                  {live.title}
                </h2>

                <p className="mt-3 break-words text-sm text-zinc-500 sm:text-base">
                  {live.venue}
                </p>

                <div className="mt-4">
                  <span className="inline-block max-w-full rounded-full bg-[#14526B]/10 px-3 py-1 text-xs font-medium text-[#14526B]">
                    {live.tour}
                  </span>
                </div>

              </div>
            </Link>
          ))}
        </div>

        {/* 検索結果なし */}
        {filteredLives.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 px-4 py-10 text-center sm:px-6 sm:py-12">

            <p className="font-semibold text-zinc-700">
              ライブが見つかりませんでした
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              検索条件を変更してみてください
            </p>

            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setYear("すべて");
              }}
              className="mt-5 rounded-full bg-[#14526B] px-5 py-2.5 text-sm font-medium text-white"
            >
              検索条件をリセット
            </button>

          </div>
        )}

      </div>
    </main>
  );
}