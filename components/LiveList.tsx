"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { lives } from "../data/lives";
import AttendedIconButton from "./AttendedIconButton";

type Live = (typeof lives)[number];

type Props = {
  filteredLives: Live[];
  attendedOnly?: boolean;
  onResetFilters?: () => void;
};

// ========================================
// LIVE LIST
// ========================================

export default function LiveList({
  filteredLives,
  attendedOnly = false,
  onResetFilters,
}: Props) {
  const [attendedIds, setAttendedIds] =
    useState<string[]>([]);

  // ========================================
  // 参戦記録を読み込む
  // ========================================

  const loadAttendedLives = () => {
    const saved =
      localStorage.getItem(
        "attendedLives"
      );

    if (!saved) {
      setAttendedIds([]);
      return;
    }

    try {
      const parsed =
        JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setAttendedIds(parsed);
      } else {
        setAttendedIds([]);
      }
    } catch {
      setAttendedIds([]);
    }
  };

  useEffect(() => {
    loadAttendedLives();
  }, []);

  // ========================================
  // 詳細ページへ行く前に
  // スクロール位置を保存
  // ========================================

  const saveScrollPosition = () => {
    sessionStorage.setItem(
      "liveSearchScrollPosition",
      String(window.scrollY)
    );

    sessionStorage.setItem(
      "liveShouldRestoreScroll",
      "true"
    );
  };

  // ========================================
  // 結果なし
  // ========================================

  if (filteredLives.length === 0) {
    return (
      <div
        className="
          mt-10
          rounded-2xl
          border
          border-dashed
          border-zinc-300
          px-4
          py-10
          text-center
          sm:px-6
          sm:py-12
        "
      >
        <p className="font-semibold text-zinc-700">
          {attendedOnly
            ? "条件に一致する参戦ライブがありません"
            : "ライブが見つかりませんでした"}
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          検索条件を変更してみてください
        </p>

        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="
              mt-5
              rounded-full
              bg-[#14526B]
              px-5
              py-2.5
              text-sm
              font-medium
              text-white
            "
          >
            検索条件をリセット
          </button>
        )}
      </div>
    );
  }

  // ========================================
  // ライブ一覧
  // ========================================

  return (
    <div
      className="
        mt-4
        -mx-4
        overflow-hidden
        border-y
        border-zinc-200
        bg-white
        sm:-mx-6
      "
    >
      {filteredLives.map(
        (
          live: Live,
          index
        ) => {
          const attended =
            attendedIds.includes(
              live.id
            );

          return (
            <div
              key={live.id}
              className={`
                relative
                bg-white

                ${
                  index !==
                  filteredLives.length - 1
                    ? "border-b border-zinc-200"
                    : ""
                }
              `}
            >
              {/* ================================= */}
              {/* ライブ詳細リンク */}
              {/* ================================= */}

              <Link
                href={`/live/${live.id}`}
                onClick={
                  saveScrollPosition
                }
                className="
                  block
                  px-3
                  py-2
                  pr-14
                  transition-colors
                  hover:bg-zinc-50
                  sm:px-4
                  sm:py-2.5
                  sm:pr-16
                "
              >
                {/* ================================= */}
                {/* 日付 */}
                {/* ================================= */}

                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`
                      h-4
                      w-4
                      shrink-0

                      ${
                        attended
                          ? "text-[#14526B]"
                          : "text-zinc-400"
                      }
                    `}
                    aria-hidden="true"
                  >
                    {attended ? (
                      <path d="M5 12.5 9 16l10-10" />
                    ) : (
                      <>
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="16"
                          rx="2"
                        />

                        <path d="M16 3v4M8 3v4M3 10h18" />
                      </>
                    )}
                  </svg>

                  <p
                    className="
                      text-[12px]
                      font-bold
                      tracking-[0.02em]
                      text-[#14526B]
                    "
                  >
                    {live.date}
                  </p>
                </div>

                {/* ================================= */}
                {/* 公演名 */}
                {/* ================================= */}

                <h2
                  className="
                    mt-1
                    pr-1
                    text-[15px]
                    font-bold
                    leading-[1.3]
                    text-[#14526B]
                    sm:text-[16px]
                  "
                >
                  {live.title}
                </h2>

                {/* ================================= */}
                {/* 都市 / 会場 */}
                {/* ================================= */}

                <div
                  className="
                    mt-1
                    flex
                    min-w-0
                    items-start
                    gap-1.5
                    text-zinc-500
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="
                      mt-[1px]
                      h-4
                      w-4
                      shrink-0
                      text-zinc-400
                    "
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

                    <circle
                      cx="12"
                      cy="10"
                      r="2.5"
                    />
                  </svg>

                  <p
                    className="
                      min-w-0
                      text-[12px]
                      leading-[1.35]
                    "
                  >
                    <span
                      className="
                        font-semibold
                        text-[#14526B]
                      "
                    >
                      {live.city}
                    </span>

                    <span className="mx-2 text-zinc-300">
                      ｜
                    </span>

                    <span>
                      {live.venue}
                    </span>
                  </p>
                </div>

                {/* ================================= */}
                {/* ツアー / セトリ */}
                {/* ================================= */}

                <div
                  className="
                    mt-1.5
                    flex
                    flex-wrap
                    items-center
                    gap-1
                  "
                >
                  {live.tour && (
                    <span
                      className="
                        max-w-full
                        rounded-full
                        bg-[#14526B]/10
                        px-2
                        py-0.5
                        text-[9px]
                        font-medium
                        leading-[1.35]
                        text-[#14526B]
                      "
                    >
                      {live.tour}
                    </span>
                  )}

                  {live.setlist.length >
                  0 ? (
                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-[#14526B]/10
                        px-2
                        py-0.5
                        text-[9px]
                        font-semibold
                        text-[#14526B]
                      "
                    >
                      セトリあり
                    </span>
                  ) : (
                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-zinc-100
                        px-2
                        py-0.5
                        text-[9px]
                        font-medium
                        text-zinc-400
                      "
                    >
                      セトリなし
                    </span>
                  )}
                </div>
              </Link>

              {/* ================================= */}
              {/* 参戦ボタン */}
              {/* ================================= */}

              <div
  className="
    absolute
    right-3
    top-2
    z-10
    sm:right-4
    sm:top-2.5
  "
  onClick={() => {
    setTimeout(() => {
      loadAttendedLives();
    }, 0);
  }}
>
  <AttendedIconButton
  liveId={live.id}
/>
</div>
            </div>
          );
        }
      )}
    </div>
  );
}