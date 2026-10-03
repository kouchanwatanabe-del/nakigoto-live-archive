"use client";

import { useMemo, useState } from "react";
import { lives } from "../data/lives";

type ParsedSetlist = {
  setlist: string[];
  encore: string[];
  rehearsal: string[];
};

type Section =
  | "setlist"
  | "encore"
  | "rehearsal";

type SongStatus = {
  song: string;
  registered: boolean;
  suggestion?: string;
};

export default function SetlistImporter() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [parsed, setParsed] =
    useState<ParsedSetlist | null>(null);
  const [copied, setCopied] =
    useState(false);

  // ========================================
  // 登録済み楽曲
  // lives.tsから自動取得
  // ========================================

  const registeredSongs = useMemo(() => {
    return [
      ...new Set(
        lives.flatMap((live) => [
          ...live.setlist,
          ...(live.encore ?? []),
        ])
      ),
    ];
  }, []);

  // ========================================
  // 比較用の文字列に変換
  // ========================================

  const normalizeSong = (
    value: string
  ) => {
    return value
      .toLowerCase()
      .replace(/\s/g, "")
      .replace(/[・･]/g, "")
      .replace(/[（）()「」『』【】]/g, "")
      .trim();
  };

  // ========================================
  // 似ている曲を探す
  // ========================================

  const findSuggestion = (
    song: string
  ) => {
    const normalized =
      normalizeSong(song);

    if (!normalized) {
      return undefined;
    }

    // 部分一致
    const partial =
      registeredSongs.find(
        (registered) => {
          const target =
            normalizeSong(
              registered
            );

          return (
            target.includes(
              normalized
            ) ||
            normalized.includes(
              target
            )
          );
        }
      );

    return partial;
  };

  // ========================================
  // 登録状況
  // ========================================

  const getSongStatus = (
    song: string
  ): SongStatus => {
    const normalized =
      normalizeSong(song);

    const exact =
      registeredSongs.find(
        (registered) =>
          normalizeSong(
            registered
          ) === normalized
      );

    if (exact) {
      return {
        song,
        registered: true,
      };
    }

    return {
      song,
      registered: false,
      suggestion:
        findSuggestion(song),
    };
  };

  // ========================================
  // 曲名の整形
  // ========================================

  const cleanLine = (
    line: string
  ) => {
    return line
      .replace(
        /^\s*\d+\s*[.．、:：\-)]?\s*/,
        ""
      )
      .replace(
        /^[・●○■□▶▷\-]\s*/,
        ""
      )
      .trim();
  };

  // ========================================
  // セクション判定
  // ========================================

  const getSection = (
    line: string
  ): Section | null => {
    const normalized = line
      .replace(
        /[【】[\]（）()]/g,
        ""
      )
      .replace(/\s/g, "")
      .toLowerCase();

    if (
      /^(リハ|リハーサル|rehearsal)$/.test(
        normalized
      )
    ) {
      return "rehearsal";
    }

    if (
      /^(en|encore|アンコール|en\d+)$/.test(
        normalized
      )
    ) {
      return "encore";
    }

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
  // 無視する行
  // ========================================

  const shouldIgnoreLine = (
    line: string
  ) => {
    if (!line) return true;

    if (/^#/.test(line)) {
      return true;
    }

    if (
      /^https?:\/\//i.test(line)
    ) {
      return true;
    }

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
  // 解析
  // ========================================

  const parseSetlist = () => {
    const lines = text
      .split(/\r?\n/)
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);

    const result: ParsedSetlist = {
      setlist: [],
      encore: [],
      rehearsal: [],
    };

    let currentSection: Section =
      "setlist";

    for (const rawLine of lines) {
      const section =
        getSection(rawLine);

      if (section) {
        currentSection =
          section;
        continue;
      }

      if (
        shouldIgnoreLine(
          rawLine
        )
      ) {
        continue;
      }

      const song =
        cleanLine(rawLine);

      if (!song) continue;

      result[
        currentSection
      ].push(song);
    }

    setParsed(result);
    setCopied(false);
  };

  // ========================================
  // 未登録候補
  // ========================================

  const unknownSongs =
    useMemo(() => {
      if (!parsed) return [];

      const songs = [
        ...parsed.setlist,
        ...parsed.encore,
        ...parsed.rehearsal,
      ];

      return songs
        .map(getSongStatus)
        .filter(
          (status) =>
            !status.registered
        );
    }, [parsed]);

  // ========================================
  // lives.ts用コード
  // ========================================

  const generatedCode =
    useMemo(() => {
      if (!parsed) return "";

      const lines: string[] = [];

      lines.push(
        "setlist: ["
      );

      parsed.setlist.forEach(
        (song) => {
          lines.push(
            `  ${JSON.stringify(
              song
            )},`
          );
        }
      );

      lines.push("],");

      if (
        parsed.encore.length >
        0
      ) {
        lines.push(
          "encore: ["
        );

        parsed.encore.forEach(
          (song) => {
            lines.push(
              `  ${JSON.stringify(
                song
              )},`
            );
          }
        );

        lines.push("],");
      }

      if (
        parsed.rehearsal
          .length > 0
      ) {
        const rehearsal =
          `リハーサル：${parsed.rehearsal.join(
            " / "
          )}`;

        lines.push(
          `memo: ${JSON.stringify(
            rehearsal
          )},`
        );
      }

      return lines.join("\n");
    }, [parsed]);

  // ========================================
  // コピー
  // ========================================

  const copyCode =
    async () => {
      if (!generatedCode) {
        return;
      }

      await navigator.clipboard.writeText(
        generatedCode
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        1500
      );
    };

  // ========================================
  // 曲表示
  // ========================================

  const renderSong = (
    song: string,
    label: string
  ) => {
    const status =
      getSongStatus(song);

    return (
      <div
        key={`${label}-${song}`}
        className="border-b border-zinc-100 py-2.5 last:border-b-0"
      >
        <div className="flex items-start gap-3">

          <span className="w-7 shrink-0 pt-0.5 text-right text-[11px] font-semibold text-zinc-300">
            {label}
          </span>

          <div className="min-w-0 flex-1">

            <div className="flex items-start justify-between gap-3">

              <span className="text-sm font-medium text-[#14526B]">
                {song}
              </span>

              {status.registered ? (
                <span className="shrink-0 text-[10px] font-bold text-[#14526B]">
                  ✓
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  未登録
                </span>
              )}

            </div>

            {!status.registered &&
              status.suggestion && (
                <p className="mt-1 text-[11px] leading-5 text-zinc-400">
                  候補：
                  <span className="font-medium text-[#14526B]">
                    {
                      status.suggestion
                    }
                  </span>
                </p>
              )}

          </div>

        </div>
      </div>
    );
  };

  return (
    <section className="mt-5">

      {/* ================================= */}
      {/* 開閉 */}
      {/* ================================= */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-xl
          border
          border-[#14526B]/20
          bg-[#14526B]/5
          px-4
          py-3.5
          text-left
          transition
          hover:bg-[#14526B]/10
        "
      >
        <div>
          <p className="text-[14px] font-bold text-[#14526B]">
            SETLIST IMPORT
          </p>

          <p className="mt-0.5 text-[11px] text-zinc-500">
            Xのポストからセトリを変換
          </p>
        </div>

        <span className="text-[#14526B]">
          {open ? "−" : "+"}
        </span>
      </button>

      {/* ================================= */}
      {/* IMPORT */}
      {/* ================================= */}

      {open && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">

          <p className="text-xs font-bold tracking-[0.15em] text-zinc-400">
            ADMIN TOOL
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#14526B]">
            SETLIST IMPORT
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Xのポスト本文を貼り付けてください。
          </p>

          <textarea
            value={text}
            onChange={(e) => {
              setText(
                e.target.value
              );
              setParsed(null);
            }}
            placeholder={`例：

リハ
退屈日和
マリッジブルー

本編
愛才
0.2
メトロポリタン

en
ドリー

#なきごと`}
            className="
              mt-4
              min-h-[240px]
              w-full
              resize-y
              rounded-xl
              border
              border-zinc-200
              bg-zinc-50
              px-4
              py-3
              text-sm
              leading-6
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
            disabled={
              !text.trim()
            }
            className="
              mt-3
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
              disabled:opacity-30
            "
          >
            解析する
          </button>

          {/* ================================= */}
          {/* RESULT */}
          {/* ================================= */}

          {parsed && (
            <div className="mt-7">

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.15em] text-zinc-400">
                    RESULT
                  </p>

                  <h3 className="mt-1 text-base font-bold text-[#14526B]">
                    解析結果
                  </h3>
                </div>

                {unknownSongs.length >
                  0 && (
                  <span className="text-[11px] font-medium text-amber-700">
                    未登録{" "}
                    {
                      unknownSongs.length
                    }
                    件
                  </span>
                )}
              </div>

              {/* SETLIST */}

              <div className="mt-6">

                <div className="flex justify-between">
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

                <div className="mt-2 border-y border-zinc-200">

                  {parsed.setlist.map(
                    (song, index) =>
                      renderSong(
                        song,
                        String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )
                      )
                  )}

                </div>
              </div>

              {/* ENCORE */}

              {parsed.encore.length >
                0 && (
                <div className="mt-6">

                  <h3 className="text-sm font-bold text-[#14526B]">
                    ENCORE
                  </h3>

                  <div className="mt-2 border-y border-zinc-200">

                    {parsed.encore.map(
                      (
                        song,
                        index
                      ) =>
                        renderSong(
                          song,
                          `E${
                            index + 1
                          }`
                        )
                    )}

                  </div>
                </div>
              )}

              {/* REHEARSAL */}

              {parsed.rehearsal
                .length > 0 && (
                <div className="mt-6">

                  <h3 className="text-sm font-bold text-[#14526B]">
                    REHEARSAL
                  </h3>

                  <div className="mt-2 border-y border-zinc-200">

                    {parsed.rehearsal.map(
                      (
                        song,
                        index
                      ) =>
                        renderSong(
                          song,
                          `R${
                            index + 1
                          }`
                        )
                    )}

                  </div>
                </div>
              )}

              {/* 注意 */}

              {unknownSongs.length >
                0 && (
                <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3">

                  <p className="text-xs font-bold text-amber-800">
                    未登録の項目があります
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-amber-700">
                    新曲・表記揺れ・ポストの文章などの可能性があります。
                    コードへ反映する前に確認してください。
                  </p>

                </div>
              )}

              {/* CODE */}

              <div className="mt-7">

                <h3 className="text-sm font-bold text-[#14526B]">
                  lives.ts 用コード
                </h3>

                <pre className="mt-2 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
                  {generatedCode}
                </pre>

                <button
                  type="button"
                  onClick={
                    copyCode
                  }
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-[#14526B]
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-[#14526B]
                  "
                >
                  {copied
                    ? "コピーしました ✓"
                    : "コードをコピー"}
                </button>

              </div>

            </div>
          )}

        </div>
      )}

    </section>
  );
}