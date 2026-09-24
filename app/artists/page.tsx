"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { lives } from "../../data/lives";

export default function ArtistsPage() {
  const [query, setQuery] = useState("");

  // ========================================
  // 対バンアーティストを集計
  // ========================================

  const artists = useMemo(() => {
    const counts: Record<string, number> = {};

    lives.forEach((live) => {
      // artists がないライブにも対応
      const liveArtists = live.artists ?? [];

      // 同じライブ内に同じアーティストが
      // 複数入っていても1公演としてカウント
      const uniqueArtists = [...new Set(liveArtists)];

      uniqueArtists.forEach((artist) => {
        const name = artist.trim();

        if (!name) return;

        counts[name] = (counts[name] ?? 0) + 1;
      });
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

  const filteredArtists = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return artists;
    }

    return artists.filter((artist) =>
      artist.name.toLowerCase().includes(keyword)
    );
  }, [artists, query]);

  return (
    <main className="min-h-screen bg-white pb-32 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 pt-8">

        {/* ================================= */}
        {/* ヘッダー */}
        {/* ================================= */}

        <div>
          <h1 className="text-[28px] font-black tracking-tight text-[#14526B]">
            ARTISTS
          </h1>

          <p className="mt-1 text-[12px] text-zinc-400">
            対バンアーティスト一覧
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
            placeholder="アーティスト名を検索"
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

          {/* 検索文字クリア */}
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
            ARTISTS
          </p>

          <p className="text-[11px] text-zinc-400">
            {filteredArtists.length}組
          </p>
        </div>

        {/* ================================= */}
        {/* アーティスト一覧 */}
        {/* ================================= */}

        <div className="mt-2 border-y border-zinc-200">
          {filteredArtists.map((artist) => (
            <Link
              key={artist.name}
              href={`/artists/${encodeURIComponent(
                artist.name
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
              {/* アーティスト名 */}

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
                  {artist.name}
                </p>
              </div>

              {/* 共演公演数 */}

              <div className="ml-4 flex shrink-0 items-center">
                <span className="text-[13px] font-bold text-[#14526B]">
                  {artist.count}
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

        {filteredArtists.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[14px] font-semibold text-zinc-500">
              該当するアーティストが見つかりません
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