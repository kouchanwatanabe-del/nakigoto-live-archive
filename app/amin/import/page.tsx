"use client";

import { useMemo, useState } from "react";

type ParsedSetlist = {
  setlist: string[];
  encore: string[];
  rehearsal: string[];
};

type Section =
  | "setlist"
  | "encore"
  | "rehearsal";

export default function SetlistImportPage() {
  const [text, setText] = useState("");
  const [parsed, setParsed] =
    useState<ParsedSetlist | null>(null);

  const [copied, setCopied] =
    useState(false);

  // ========================================
  // 行の整形
  // ========================================

  const cleanLine = (line: string) => {
    return line
      // 1. 曲名 / 01 曲名 / 1、曲名
      .replace(
        /^\s*\d+\s*[.．、:：\-)]?\s*/,
        ""
      )

      // 箇条書き
      .replace(
        /^[・●○■□▶▷\-]\s*/,
        ""
      )

      .trim();
  };

  // ========================================
  // 無視する行
  // ========================================

  const shouldIgnoreLine = (
    line: string
  ) => {
    if (!line) return true;

    // ハッシュタグだけの行
    if (/^#/.test(line)) {
      return true;
    }

    // URL
    if (/^https?:\/\//i.test(line)) {
      return true;
    }

    // 基本的な見出し
    if (
      /^(セットリスト|セトリ|set\s?list)$/i.test(
        line
      )
    ) {
      return true;
    }

    return false;
  };

  // ========================================
  // セクション判定
  // ========================================

  const getSection = (
    line: string
  ): Section | null => {
    const normalized = line
      .replace(/[【】[\]（）()]/g, "")
      .replace(/\s/g, "")
      .toLowerCase();

    // リハーサル
    if (
      /^(リハ|リハーサル|rehearsal)$/.test(
        normalized
      )
    ) {
      return "rehearsal";
    }

    // アンコール
    if (
      /^(en|encore|アンコール|en\d+)$/.test(
        normalized
      )
    ) {
      return "encore";
    }

    // 本編
    if (
      /^(本編|main|本番)$/.test(
        normalized
      )
    ) {
      return "setlist";
    }

    return null;
  };

  // ========================================
  // 解析
  // ========================================

  const parseSetlist = () => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const result: ParsedSetlist = {
      setlist: [],
      encore: [],
      rehearsal: [],
    };

    // セクション指定がない場合は
    // 最初から本編として扱う
    let currentSection: Section =
      "setlist";

    for (const rawLine of lines) {
      // ------------------------------------
      // セクション見出し
      // ------------------------------------

      const section =
        getSection(rawLine);

      if (section) {
        currentSection = section;
        continue;
      }

      // ------------------------------------
      // 無視する行
      // ------------------------------------

      if (
        shouldIgnoreLine(rawLine)
      ) {
        continue;
      }

      // ------------------------------------
      // 曲名を整形
      // ------------------------------------

      const song =
        cleanLine(rawLine);

      if (!song) continue;

      // ------------------------------------
      // 各セクションへ追加
      // ------------------------------------

      result[currentSection].push(
        song
      );
    }

    setParsed(result);
    setCopied(false);
  };

  // ========================================
  // 合計曲数
  // ========================================

  const totalSongs = useMemo(() => {
    if (!parsed) return 0;

    return (
      parsed.setlist.length +
      parsed.encore.length
    );
  }, [parsed]);

  // ========================================
  // lives.ts 用コード
  // ========================================

  const generatedCode =
    useMemo(() => {
      if (!parsed) return "";

      const lines: string[] = [];

      // ------------------------------------
      // SETLIST
      // ------------------------------------

      lines.push("setlist: [");

      for (
        const song of parsed.setlist
      ) {
        lines.push(
          `  ${JSON.stringify(song)},`
        );
      }

      lines.push("],");

      // ------------------------------------
      // ENCORE
      // ------------------------------------

      if (
        parsed.encore.length > 0
      ) {
        lines.push(
          "encore: ["
        );

        for (
          const song of parsed.encore
        ) {
          lines.push(
            `  ${JSON.stringify(song)},`
          );
        }

        lines.push("],");
      }

      // ------------------------------------
      // MEMO / リハーサル
      // ------------------------------------

      if (
        parsed.rehearsal.length > 0
      ) {
        const rehearsalText =
          `リハーサル：${parsed.rehearsal.join(
            " / "
          )}`;

        lines.push(
          `memo: ${JSON.stringify(
            rehearsalText
          )},`
        );
      }

      return lines.join("\n");
    }, [parsed]);

  // ========================================
  // コピー
  // ========================================

  const copyCode = async () => {
    if (!generatedCode) return;

    await navigator.clipboard.writeText(
      generatedCode
    );

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-zinc-400">
            ADMIN
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#14526B]">
            SETLIST IMPORT
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Xのポスト本文から
            本編・アンコール・リハーサルを
            自動で振り分けます。
          </p>
        </div>

        {/* ================================= */}
        {/* INPUT */}
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
            onChange={(e) => {
              setText(
                e.target.value
              );
              setParsed(null);
            }}
            placeholder={`例：

なきごと セトリ

リハ
退屈日和
マリッジブルー

本編
愛才
0.2
Summer麺
メトロポリタン
短夜

アンコール
ドリー

#なきごと`}
            className="
              mt-3
              min-h-[300px]
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
            onClick={
              parseSetlist
            }
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
        {/* RESULT */}
        {/* ================================= */}

        {parsed && (
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
                {totalSongs}曲
              </p>
            </div>

            {/* ================================= */}
            {/* SETLIST */}
            {/* ================================= */}

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#14526B]">
                  SET LIST
                </h3>

                <span className="text-xs text-zinc-400">
                  {
                    parsed.setlist
                      .length
                  }
                  曲
                </span>
              </div>

              {parsed.setlist
                .length > 0 ? (
                <div className="mt-3 border-y border-zinc-200">

                  {parsed.setlist.map(
                    (
                      song,
                      index
                    ) => (
                      <div
                        key={`${song}-${index}`}
                        className={`
                          flex
                          items-center
                          gap-4
                          py-3
                          ${
                            index !==
                            parsed
                              .setlist
                              .length -
                              1
                              ? "border-b border-zinc-100"
                              : ""
                          }
                        `}
                      >
                        <span className="w-7 shrink-0 text-right text-xs font-semibold text-zinc-300">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span className="font-medium text-[#14526B]">
                          {song}
                        </span>
                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-400">
                  本編の曲はありません。
                </p>
              )}
            </div>

            {/* ================================= */}
            {/* ENCORE */}
            {/* ================================= */}

            {parsed.encore.length >
              0 && (
              <div className="mt-8">

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#14526B]">
                    ENCORE
                  </h3>

                  <span className="text-xs text-zinc-400">
                    {
                      parsed.encore
                        .length
                    }
                    曲
                  </span>
                </div>

                <div className="mt-3 border-y border-zinc-200">

                  {parsed.encore.map(
                    (
                      song,
                      index
                    ) => (
                      <div
                        key={`${song}-${index}`}
                        className={`
                          flex
                          items-center
                          gap-4
                          py-3
                          ${
                            index !==
                            parsed
                              .encore
                              .length -
                              1
                              ? "border-b border-zinc-100"
                              : ""
                          }
                        `}
                      >
                        <span className="w-7 shrink-0 text-right text-xs font-semibold text-zinc-300">
                          E
                          {index + 1}
                        </span>

                        <span className="font-medium text-[#14526B]">
                          {song}
                        </span>
                      </div>
                    )
                  )}

                </div>
              </div>
            )}

            {/* ================================= */}
            {/* REHEARSAL */}
            {/* ================================= */}

            {parsed.rehearsal
              .length > 0 && (
              <div className="mt-8">

                <h3 className="text-sm font-bold text-[#14526B]">
                  REHEARSAL
                </h3>

                <div className="mt-3 rounded-xl bg-zinc-50 px-4 py-3">
                  <p className="text-sm leading-6 text-zinc-600">
                    {parsed.rehearsal.join(
                      " / "
                    )}
                  </p>
                </div>

              </div>
            )}

            {/* ================================= */}
            {/* GENERATED CODE */}
            {/* ================================= */}

            <div className="mt-10">

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
                {copied
                  ? "コピーしました ✓"
                  : "コードをコピー"}
              </button>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}