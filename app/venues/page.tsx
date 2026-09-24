"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { lives } from "../../data/lives";

export default function VenuesPage() {
  const [query, setQuery] = useState("");

  // ========================================
  // 会場ごとの公演数を集計
  // ========================================

  const venues = useMemo(() => {
    const counts: Record<string, number> = {};

    lives.forEach((live) => {
      const venue = live.venue?.trim();

      if (!venue) return;

      counts[venue] = (counts[venue] ?? 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, "ja")
      );
  }, []);

  // ========================================
  // 検索
  // ========================================

  const filteredVenues = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return venues;
    }

    return venues.filter((venue) =>
      venue.name.toLowerCase().includes(keyword)
    );
  }, [venues, query]);

  return (
    <main className="min-h-screen bg-white pb-32 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 pt-8">

        {/* ================================= */}
        {/* ヘッダー */}
        {/* ================================= */}

        <div>
          <h1 className="text-[28px] font-black tracking-tight text-[#14526B]">
            VENUES
          </h1>

          <p className="mt-1 text-[12px] text-zinc-400">
            ライブ会場一覧
          </p>
        </div>

        {/* ================================= */}
        {/* 検索 */}
        {/* ================================= */}

        <div className="relative mt-6">
          <Search
            size={17}
            strokeWidth={2}
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-zinc-400
            "
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="会場名を検索"
            className="
              h-[46px]
              w-full
              rounded-xl
              border
              border-zinc-200
              bg-zinc-50
              pl-11
              pr-11
              text-[14px]
              text-[#14526B]
              outline-none
              transition
              placeholder:text-zinc-400
              focus:border-[#14526B]
              focus:bg-white
            "
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="検索をクリア"
              className="
                absolute
                right-3
                top-1/2
                flex
                h-7
                w-7
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                text-zinc-400
                transition
                hover:bg-zinc-100
                hover:text-[#14526B]
              "
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* ================================= */}
        {/* 件数 */}
        {/* ================================= */}

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.16em] text-zinc-400">
            VENUES
          </p>

          <p className="text-[11px] text-zinc-400">
            {filteredVenues.length}会場
          </p>
        </div>

        {/* ================================= */}
        {/* 会場一覧 */}
        {/* ================================= */}

        <div className="mt-2 border-y border-zinc-200">
          {filteredVenues.map((venue) => (
            <Link
              key={venue.name}
              href={`/venues/${encodeURIComponent(
                venue.name
              )}`}
              className="
                group
                flex
                min-h-[54px]
                items-center
                border-b
                border-zinc-100
                py-3
                transition
                last:border-b-0
              "
            >
              {/* 会場名 */}

              <div className="min-w-0 flex-1">
                <p
                  className="
                    break-words
                    text-[14px]
                    font-semibold
                    leading-snug
                    text-[#14526B]
                    transition
                    group-hover:opacity-70
                  "
                >
                  {venue.name}
                </p>
              </div>

              {/* 公演数 */}

              <div className="ml-4 flex shrink-0 items-center">
                <span className="text-[13px] font-bold text-[#14526B]">
                  {venue.count}
                </span>

                <span className="ml-1 text-[11px] text-zinc-400">
                  公演
                </span>

                <span className="ml-3 text-[12px] text-zinc-300">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ================================= */}
        {/* 検索結果なし */}
        {/* ================================= */}

        {filteredVenues.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[14px] font-semibold text-zinc-500">
              該当する会場が見つかりません
            </p>

            <p className="mt-2 text-[12px] text-zinc-400">
              別のキーワードで検索してみてください
            </p>
          </div>
        )}

      </div>
    </main>
  );
}