"use client";

import { useMemo, useState } from "react";

export default function SetlistImportPage() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<
    string[]
  >([]);

  // ========================================
  // 除外する行
  // ========================================

  const ignorePatterns = [
    /^#/, // ハッシュタグ
    /^https?:\/\//i, // URL
    /^セットリスト$/i,
    /^セトリ$/i,
    /^set\s?list$/i,
    /^本編$/i,
    /^なきごと$/i,
  ];

  // ========================================
  // セトリ解析
  // ========================================

  const parseSetlist = () => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const songs = lines
      .filter((line) => {
        return !ignorePatterns.some(
          (pattern) =>
            pattern.test(line)
        );
      })

      // 先頭の番号を削除
      //
      // 1. 愛才
      // 01 愛才
      // 1、愛才
      // → 愛才

      .map((line) =>
        line.replace(
          /^\d+\s*[.．、:：\-]?\s*/,
          ""
        )
      )

      // Xの箇条書き記号などを削除

      .map((line) =>
        line.replace(
          /^[・●○■□▶︎▶︎▷\-]\s*/,
          ""
        )
      )

      .map((line) =>
        line.trim()
      )

      .filter(Boolean);

    setParsed(songs);
  };

  // ========================================
  // コード生成
  // ========================================

  const generatedCode =
    useMemo(() => {
      if (parsed.length === 0) {
        return "";
      }

      const songLines = parsed
        .map(
          (song) =>
            `  "${song.replace(
              /"/g,
              '\\"'
            )}",`
        )
        .join("\n");

      return `setlist: [
${songLines}
],`;
    }, [parsed]);

  // ========================================
  // コピー
  // ========================================

  const copyCode = async () => {
    if (!generatedCode) return;

    await navigator.clipboard.writeText(
      generatedCode
    );
  };

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        {/* ================================= */}
        {/* タイトル */}
        {/* ================================= */}

        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-zinc-400">
            ADMIN
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#14526B]">
            SETLIST IMPORT
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Xのポスト本文を貼り付けて
            セットリストを解析します。
          </p>
        </div>

        {/* ================================= */}
        {/* 入力 */}
        {/* ================================= */}

        <section className="mt-8">
          <label
            htmlFor="post"
            className="text-sm font-bold text-[#14526B]"
          >
            Xのポスト本文
          </label>

          <textarea
            id="post"
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder={`例：

なきごと セトリ

1. 愛才
2. マリッジブルー
3. 0.2
4. メトロポリタン
5. 短夜

en
ドリー

#なきごと`}
            className="
              mt-3
              min-h-[260px]
              w-full
              resize-y
              rounded-2xl
              border
              border-zinc-200
              bg-zinc-50
              px-4
              py-4
              text-base
              leading-7
              outline-none
              transition
              placeholder:text-zinc-300
              focus:border-[#14526B]
              focus:bg-white
            "
          />

          <button
            type="button"
            onClick={parseSetlist}
            disabled={!text.trim()}
            className="
              mt-4
              w-full
              rounded-xl
              bg-[#14526B]
              px-4
              py-3
              text-sm
              font-bold
              text-white
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            解析する
          </button>
        </section>

        {/* ================================= */}
        {/* 解析結果 */}
        {/* ================================= */}

        {parsed.length > 0 && (
          <section className="mt-10">

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.15em] text-zinc-400">
                  RESULT
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#14526B]">
                  解析結果
                </h2>
              </div>

              <p className="text-xs text-zinc-400">
                {parsed.length}曲
              </p>
            </div>

            {/* 曲一覧 */}

            <div className="mt-4 border-y border-zinc-200">

              {parsed.map(
                (song, index) => (
                  <div
                    key={`${song}-${index}`}
                    className={`
                      flex
                      items-center
                      gap-4
                      py-3
                      ${
                        index !==
                        parsed.length - 1
                          ? "border-b border-zinc-100"
                          : ""
                      }
                    `}
                  >
                    <span className="w-7 shrink-0 text-right text-xs font-semibold text-zinc-300">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>

                    <span className="font-medium text-[#14526B]">
                      {song}
                    </span>
                  </div>
                )
              )}

            </div>

            {/* ================================= */}
            {/* 生成コード */}
            {/* ================================= */}

            <div className="mt-8">
              <p className="text-sm font-bold text-[#14526B]">
                lives.ts 用コード
              </p>

              <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
                {generatedCode}
              </pre>

              <button
                type="button"
                onClick={copyCode}
                className="
                  mt-3
                  w-full
                  rounded-xl
                  border
                  border-[#14526B]
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-[#14526B]
                  transition
                  hover:bg-[#14526B]
                  hover:text-white
                "
              >
                コードをコピー
              </button>
            </div>

          </section>
        )}

      </div>
    </main>
  );
}