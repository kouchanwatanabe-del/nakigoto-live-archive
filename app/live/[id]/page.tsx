import Link from "next/link";
import { lives } from "../../../data/lives";
import AttendedButton from "../../../components/AttendedButton";

type LiveId = (typeof lives)[number]["id"];

export default async function LivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const live = lives.find(
    (live) => live.id === (id as LiveId)
  );

  if (!live) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-900">
        ライブが見つかりません
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-28 text-zinc-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-9">

        {/* ================================= */}
        {/* 戻る */}
        {/* ================================= */}

        <Link
          href="/lives"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#14526B] transition-opacity hover:opacity-60"
        >
          <span>←</span>
          <span>LIVE</span>
        </Link>

        {/* ================================= */}
        {/* ライブ情報 */}
        {/* ================================= */}

        <section className="mt-5">

          <p className="text-[12px] font-semibold tracking-[0.03em] text-[#14526B]">
            {live.date}
          </p>

          <h1 className="mt-1.5 text-[21px] font-bold leading-[1.35] text-[#14526B] sm:text-[24px]">
            {live.title}
          </h1>

          <div className="mt-2 flex items-start gap-1.5 text-[12px] leading-5 text-zinc-500 sm:text-[13px]">

            {/* ピン */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-[2px] h-4 w-4 shrink-0 text-zinc-400"
              aria-hidden="true"
            >
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>

            <p>
              <span className="font-semibold text-[#14526B]">
                {live.city}
              </span>

              <span className="mx-1.5 text-zinc-300">
                ｜
              </span>

              {live.venue}
            </p>

          </div>

          {/* ツアー */}
          {live.tour && (
            <div className="mt-2.5">
              <span className="inline-block rounded-full bg-[#14526B]/10 px-2.5 py-1 text-[10px] font-medium leading-4 text-[#14526B]">
                {live.tour}
              </span>
            </div>
          )}

          {/* 参戦ボタン */}
          <div className="mt-4">
            <AttendedButton liveId={live.id} />
          </div>

        </section>

        {/* ================================= */}
        {/* SETLIST */}
        {/* ================================= */}

        <section className="mt-8 border-t border-zinc-200 pt-6">

          <div className="flex items-end justify-between gap-4">

            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400">
                SETLIST
              </p>

              <h2 className="mt-1 text-[18px] font-bold text-[#14526B]">
                セットリスト
              </h2>
            </div>

            {live.setlist.length > 0 && (
              <p className="text-[11px] text-zinc-400">
                {live.setlist.length}曲
              </p>
            )}

          </div>

          {/* セトリあり */}
          {live.setlist.length > 0 ? (
            <ol className="mt-4">

              {live.setlist.map(
                (song: string, index: number) => (
                  <li
                    key={`${song}-${index}`}
                    className="border-b border-zinc-100 last:border-b-0"
                  >
                    <Link
                      href={`/songs/${encodeURIComponent(song)}`}
                      className="group flex min-h-[34px] items-center gap-3 py-1.5"
                    >

                      {/* 曲番号 */}
                      <span className="w-6 shrink-0 text-right font-mono text-[10px] tabular-nums text-zinc-400">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      {/* 曲名 */}
                      <span className="min-w-0 flex-1 text-[14px] font-semibold leading-[1.35] text-[#14526B] transition-opacity group-hover:opacity-60">
                        {song}
                      </span>

                      {/* 矢印 */}
                      <span
                        className="shrink-0 text-[14px] text-zinc-300 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      >
                        ›
                      </span>

                    </Link>
                  </li>
                )
              )}

            </ol>
          ) : (
            <div className="mt-4 py-5 text-center">
              <p className="text-[12px] text-zinc-400">
                セットリスト情報はありません
              </p>
            </div>
          )}

        </section>

        {/* ================================= */}
        {/* ENCORE */}
        {/* ================================= */}

        {"encore" in live &&
          Array.isArray(live.encore) &&
          live.encore.length > 0 && (
            <section className="mt-7 border-t border-zinc-200 pt-6">

              <div className="flex items-end justify-between gap-4">

                <div>
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400">
                    ENCORE
                  </p>

                  <h2 className="mt-1 text-[18px] font-bold text-[#14526B]">
                    アンコール
                  </h2>
                </div>

                <p className="text-[11px] text-zinc-400">
                  {live.encore.length}曲
                </p>

              </div>

              <ol className="mt-4">

                {live.encore.map(
                  (song: string, index: number) => (
                    <li
                      key={`${song}-encore-${index}`}
                      className="border-b border-zinc-100 last:border-b-0"
                    >
                      <Link
                        href={`/songs/${encodeURIComponent(song)}`}
                        className="group flex min-h-[34px] items-center gap-3 py-1.5"
                      >

                        <span className="w-6 shrink-0 text-right font-mono text-[10px] tabular-nums text-zinc-400">
                          E{index + 1}
                        </span>

                        <span className="min-w-0 flex-1 text-[14px] font-semibold leading-[1.35] text-[#14526B] transition-opacity group-hover:opacity-60">
                          {song}
                        </span>

                        <span
                          className="shrink-0 text-[14px] text-zinc-300 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        >
                          ›
                        </span>

                      </Link>
                    </li>
                  )
                )}

              </ol>

            </section>
          )}

        {/* ================================= */}
        {/* MEMO */}
        {/* ================================= */}

        {"memo" in live &&
          typeof live.memo === "string" &&
          live.memo && (
            <section className="mt-7 border-t border-zinc-200 pt-6">

              <p className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400">
                MEMO
              </p>

              <p className="mt-2 whitespace-pre-wrap text-[12px] leading-6 text-zinc-500">
                {live.memo}
              </p>

            </section>
          )}

      </div>
    </main>
  );
}