"use client";

import { useState } from "react";

type ParsedSetlist = {
  setlist: string[];
  encore: string[];
  rehearsal: string[];
};

type Section =
  | "setlist"
  | "encore"
  | "rehearsal";

export default function SetlistImporter() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const [parsed, setParsed] =
    useState<ParsedSetlist | null>(null);

  // ライブ情報
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [tour, setTour] = useState("");
  const [artists, setArtists] = useState("");
  const [memo, setMemo] = useState("");

  const [
    excludeFromSongHistory,
    setExcludeFromSongHistory,
  ] = useState(false);

  // 管理者認証
  const [adminSecret, setAdminSecret] =
    useState("");

  // 保存状態
  const [saving, setSaving] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // ========================================
  // 曲名の整形
  // ========================================

  const cleanLine = (line: string) => {
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
      .replace(/[【】[\]（）()]/g, "")
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

    if (/^https?:\/\//i.test(line)) {
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
  // セトリ解析
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

    let currentSection: Section =
      "setlist";

    for (const rawLine of lines) {
      const section =
        getSection(rawLine);

      if (section) {
        currentSection = section;
        continue;
      }

      if (
        shouldIgnoreLine(rawLine)
      ) {
        continue;
      }

      const song =
        cleanLine(rawLine);

      if (!song) continue;

      result[currentSection].push(song);
    }

    setParsed(result);
    setSuccessMessage("");
    setErrorMessage("");
  };

  // ========================================
  // ライブをSupabaseへ追加
  // ========================================

  const addLive = async () => {
    if (!parsed) return;

    setSuccessMessage("");
    setErrorMessage("");

    if (
      !date ||
      !title.trim() ||
      !city.trim() ||
      !venue.trim()
    ) {
      setErrorMessage(
        "日付・公演名・都道府県・会場を入力してください。"
      );
      return;
    }

    if (parsed.setlist.length === 0) {
      setErrorMessage(
        "セットリストがありません。"
      );
      return;
    }

    if (!adminSecret) {
      setErrorMessage(
        "管理者パスワードを入力してください。"
      );
      return;
    }

    setSaving(true);

    try {
      // 例：2026-10-03
      // 同日に複数公演がある場合にも対応できるよう
      // タイトルから短い識別子を付ける
      const slug = title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(
          /[^a-z0-9ぁ-んァ-ヶ一-龠ー-]/g,
          ""
        )
        .slice(0, 30);

      const id = slug
        ? `${date}-${slug}`
        : date;

      // リハーサルはmemoへ追加
      const rehearsalMemo =
        parsed.rehearsal.length > 0
          ? `リハーサル：${parsed.rehearsal.join(
              " / "
            )}`
          : "";

      const finalMemo = [
        rehearsalMemo,
        memo.trim(),
      ]
        .filter(Boolean)
        .join("\n");

      // 対バンは「/」または改行区切り
      const artistList = artists
        .split(/\r?\n|\/|／/)
        .map((artist) => artist.trim())
        .filter(Boolean);

      const response = await fetch(
        "/api/lives",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-admin-secret":
              adminSecret,
          },

          body: JSON.stringify({
            id,
            date,
            title: title.trim(),
            city: city.trim(),
            venue: venue.trim(),
            tour: tour.trim(),
            artists: artistList,
            setlist: parsed.setlist,
            encore: parsed.encore,
            memo: finalMemo,
            excludeFromSongHistory,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.details ||
            result.error ||
            "ライブの追加に失敗しました。"
        );
        return;
      }

      setSuccessMessage(
        "ライブを追加しました ✓"
      );

      // 入力内容をリセット
      setText("");
      setParsed(null);

      setDate("");
      setTitle("");
      setCity("");
      setVenue("");
      setTour("");
      setArtists("");
      setMemo("");

      setExcludeFromSongHistory(false);

      // adminSecretは残す
      // 同日に複数登録するとき入力し直さなくてよい

    } catch (error) {
      console.error(error);

      setErrorMessage(
        "通信エラーが発生しました。"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // 共通input
  // ========================================

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-300 focus:border-[#14526B]";

  return (
    <section className="mt-5">

      {/* ================================= */}
      {/* 開閉 */}
      {/* ================================= */}

      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
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
            Xのポストからライブを追加
          </p>
        </div>

        <span className="text-[#14526B]">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">

          <p className="text-xs font-bold tracking-[0.15em] text-zinc-400">
            ADMIN TOOL
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#14526B]">
            SETLIST IMPORT
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Xのポスト本文を貼り付けて解析します。
          </p>

          {/* ================================= */}
          {/* X本文 */}
          {/* ================================= */}

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setParsed(null);
              setSuccessMessage("");
              setErrorMessage("");
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
              min-h-[220px]
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
            onClick={parseSetlist}
            disabled={!text.trim()}
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
          {/* 解析後 */}
          {/* ================================= */}

          {parsed && (
            <div className="mt-8">

              {/* ================================= */}
              {/* ライブ情報 */}
              {/* ================================= */}

              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] text-zinc-400">
                  LIVE INFO
                </p>

                <h3 className="mt-1 text-lg font-bold text-[#14526B]">
                  ライブ情報
                </h3>

                <div className="mt-4 space-y-4">

                  <label className="block">
                    <span className="text-xs font-bold text-zinc-600">
                      日付 *
                    </span>

                    <input
                      type="date"
                      value={date}
                      onChange={(e) =>
                        setDate(
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold text-zinc-600">
                      公演名 *
                    </span>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) =>
                        setTitle(
                          e.target.value
                        )
                      }
                      placeholder="TOKYO CALLING 2026"
                      className={
                        inputClass
                      }
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    <label className="block">
                      <span className="text-xs font-bold text-zinc-600">
                        都道府県 *
                      </span>

                      <input
                        type="text"
                        value={city}
                        onChange={(e) =>
                          setCity(
                            e.target.value
                          )
                        }
                        placeholder="東京"
                        className={
                          inputClass
                        }
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-zinc-600">
                        会場 *
                      </span>

                      <input
                        type="text"
                        value={venue}
                        onChange={(e) =>
                          setVenue(
                            e.target.value
                          )
                        }
                        placeholder="Veats Shibuya"
                        className={
                          inputClass
                        }
                      />
                    </label>

                  </div>

                  <label className="block">
                    <span className="text-xs font-bold text-zinc-600">
                      ツアー
                    </span>

                    <input
                      type="text"
                      value={tour}
                      onChange={(e) =>
                        setTour(
                          e.target.value
                        )
                      }
                      placeholder="任意"
                      className={
                        inputClass
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-bold text-zinc-600">
                      対バン
                    </span>

                    <textarea
                      value={artists}
                      onChange={(e) =>
                        setArtists(
                          e.target.value
                        )
                      }
                      placeholder={`LOCAL CONNECT / Hakubi / BRADIO`}
                      className={`${inputClass} min-h-[80px] resize-y`}
                    />

                    <span className="mt-1 block text-[10px] text-zinc-400">
                      「/」または改行で区切れます
                    </span>
                  </label>

                </div>
              </div>

              {/* ================================= */}
              {/* SET LIST */}
              {/* ================================= */}

              <div className="mt-8">

                <div className="flex items-center justify-between">

                  <h3 className="text-sm font-bold text-[#14526B]">
                    SET LIST
                  </h3>

                  <span className="text-xs text-zinc-400">
                    {parsed.setlist.length}
                    曲
                  </span>

                </div>

                <div className="mt-2 border-y border-zinc-200">

                  {parsed.setlist.map(
                    (song, index) => (
                      <div
                        key={`${song}-${index}`}
                        className="flex gap-3 border-b border-zinc-100 py-2.5 last:border-b-0"
                      >
                        <span className="w-6 shrink-0 text-right text-xs text-zinc-300">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span className="text-sm font-medium text-[#14526B]">
                          {song}
                        </span>
                      </div>
                    )
                  )}

                </div>

              </div>

              {/* ================================= */}
              {/* ENCORE */}
              {/* ================================= */}

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
                      ) => (
                        <div
                          key={`${song}-${index}`}
                          className="flex gap-3 border-b border-zinc-100 py-2.5 last:border-b-0"
                        >
                          <span className="w-6 shrink-0 text-right text-xs text-zinc-300">
                            E
                            {index + 1}
                          </span>

                          <span className="text-sm font-medium text-[#14526B]">
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
                <div className="mt-6">

                  <h3 className="text-sm font-bold text-[#14526B]">
                    REHEARSAL
                  </h3>

                  <p className="mt-2 rounded-xl bg-zinc-50 px-3 py-2.5 text-sm leading-6 text-zinc-600">
                    {parsed.rehearsal.join(
                      " / "
                    )}
                  </p>

                </div>
              )}

              {/* ================================= */}
              {/* その他 */}
              {/* ================================= */}

              <div className="mt-8 border-t border-zinc-200 pt-6">

                <label className="block">

                  <span className="text-xs font-bold text-zinc-600">
                    メモ
                  </span>

                  <textarea
                    value={memo}
                    onChange={(e) =>
                      setMemo(
                        e.target.value
                      )
                    }
                    placeholder="任意"
                    className={`${inputClass} min-h-[90px] resize-y`}
                  />

                </label>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-zinc-50 p-3">

                  <input
                    type="checkbox"
                    checked={
                      excludeFromSongHistory
                    }
                    onChange={(e) =>
                      setExcludeFromSongHistory(
                        e.target.checked
                      )
                    }
                    className="mt-0.5 h-4 w-4 accent-[#14526B]"
                  />

                  <div>
                    <p className="text-xs font-bold text-zinc-700">
                      曲履歴から除外
                    </p>

                    <p className="mt-0.5 text-[10px] leading-4 text-zinc-400">
                      弾き語りなど、SONGSの演奏履歴に含めないライブ
                    </p>
                  </div>

                </label>

              </div>

              {/* ================================= */}
              {/* ADMIN認証 */}
              {/* ================================= */}

              <div className="mt-7">

                <label className="block">

                  <span className="text-xs font-bold text-zinc-600">
                    管理者パスワード
                  </span>

                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) =>
                      setAdminSecret(
                        e.target.value
                      )
                    }
                    autoComplete="off"
                    placeholder="ADMIN_SECRET"
                    className={
                      inputClass
                    }
                  />

                </label>

              </div>

              {/* ================================= */}
              {/* メッセージ */}
              {/* ================================= */}

              {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mt-4 rounded-xl bg-[#14526B]/10 px-4 py-3 text-xs font-bold text-[#14526B]">
                  {successMessage}
                </div>
              )}

              {/* ================================= */}
              {/* 保存 */}
              {/* ================================= */}

              <button
                type="button"
                onClick={addLive}
                disabled={saving}
                className="
                  mt-5
                  w-full
                  rounded-xl
                  bg-[#14526B]
                  px-4
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {saving
                  ? "追加しています..."
                  : "ライブ一覧に追加"}
              </button>

              <p className="mt-2 text-center text-[10px] leading-4 text-zinc-400">
                内容を確認してから追加してください
              </p>

            </div>
          )}

        </div>
      )}

    </section>
  );
}