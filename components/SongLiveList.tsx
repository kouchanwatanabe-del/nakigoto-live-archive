"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { lives } from "../data/lives";

type Live = (typeof lives)[number];

type Props = {
  playedLives: Live[];
  color?: string;
};

type SortOrder =
  | "newest"
  | "oldest";

export default function SongLiveList({
  playedLives,
  color = "#14526B",
}: Props) {
  const [sortOrder, setSortOrder] =
    useState<SortOrder>("newest");

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
      <div className="flex items-center justify-between gap-4">

        <h2
          className="text-lg font-bold"
          style={{ color }}
        >
          演奏したライブ
        </h2>

        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target.value as SortOrder
            )
          }
          aria-label="ライブの並び順"
          className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium outline-none transition"
          style={{ color }}
        >
          <option value="newest">
            新しい順
          </option>

          <option value="oldest">
            古い順
          </option>
        </select>

      </div>

      <div className="mt-4 -mx-4 border-y border-zinc-200 bg-white sm:-mx-6">

        {sortedLives.map(
          (live, index) => (
            <Link
              key={live.id}
              href={`/live/${live.id}`}
              className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 sm:px-6 ${
                index !==
                sortedLives.length - 1
                  ? "border-b border-zinc-200"
                  : ""
              }`}
            >
              <div className="min-w-0 flex-1">

                <p
                  className="text-[12px] font-semibold"
                  style={{ color }}
                >
                  {live.date}
                </p>

                <h3
                  className="mt-1 font-bold leading-[1.4]"
                  style={{ color }}
                >
                  {live.title}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">

                  <span
                    className="font-medium"
                    style={{ color }}
                  >
                    {live.city}
                  </span>

                  <span className="mx-1.5 text-zinc-300">
                    ｜
                  </span>

                  {live.venue}

                </p>

              </div>

              <span
                className="shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                ›
              </span>

            </Link>
          )
        )}

      </div>
    </>
  );
}