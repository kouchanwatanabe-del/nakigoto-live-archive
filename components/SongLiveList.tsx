"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { lives } from "../data/lives";

type Live = (typeof lives)[number];

type Props = {
  playedLives: Live[];
};

type SortOrder =
  | "newest"
  | "oldest";

export default function SongLiveList({
  playedLives,
}: Props) {
  const [sortOrder, setSortOrder] =
    useState<SortOrder>("newest");

  // ========================================
  // 並び替え
  // ========================================

  const sortedLives = useMemo(() => {
    return [...playedLives].sort(
      (a, b) => {
        if (
          sortOrder === "newest"
        ) {
          return b.date.localeCompare(
            a.date
          );
        }

        return a.date.localeCompare(
          b.date
        );
      }
    );
  }, [playedLives, sortOrder]);

  return (
    <>
      {/* ================================= */}
      {/* 見出し・並び替え */}
      {/* ================================= */}

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-[#14526B]">
          演奏したライブ
        </h2>

        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target
                .value as SortOrder
            )
          }
          aria-label="ライブの並び順"
          className="
            cursor-pointer
            rounded-lg
            border
            border-zinc-200
            bg-white
            px-2.5
            py-1.5
            text-[11px]
            font-medium
            text-[#14526B]
            outline-none
            transition
            focus:border-[#14526B]
          "
        >
          <option value="newest">
            新しい順
          </option>

          <option value="oldest">
            古い順
          </option>
        </select>
      </div>

      {/* ================================= */}
      {/* 演奏ライブ */}
      {/* ================================= */}

      <div className="mt-4 -mx-4 border-y border-zinc-200 bg-white sm:-mx-6">
        {sortedLives.map(
          (live, index) => (
            <Link
              key={live.id}
              href={`/live/${live.id}`}
              className={`
                group
                flex
                items-center
                gap-3
                px-4
                py-3
                transition-colors
                hover:bg-zinc-50
                sm:px-6

                ${
                  index !==
                  sortedLives.length -
                    1
                    ? "border-b border-zinc-200"
                    : ""
                }
              `}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-[#14526B]">
                  {live.date}
                </p>

                <h3 className="mt-1 font-bold leading-[1.4] text-[#14526B]">
                  {live.title}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  <span className="font-medium text-[#14526B]">
                    {live.city}
                  </span>

                  <span className="mx-1.5 text-zinc-300">
                    ｜
                  </span>

                  {live.venue}
                </p>
              </div>

              <span className="shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5">
                ›
              </span>
            </Link>
          )
        )}
      </div>
    </>
  );
}