import Link from "next/link";
import { notFound } from "next/navigation";
import { lives } from "../../../data/lives";

type Props = {
  params: Promise<{
    name: string;
  }>;
};

export default async function VenueDetailPage({
  params,
}: Props) {
  const { name } = await params;

  // URLから会場名を取得
  const venueName = decodeURIComponent(name);

  // ========================================
  // この会場で開催されたライブ
  // ========================================

  const venueLives = lives
    .filter((live) => {
      return live.venue === venueName;
    })
    .sort((a, b) =>
      b.date.localeCompare(a.date)
    );

  // 該当する会場が存在しない場合
  if (venueLives.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white pb-32 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 pt-8">

        {/* ================================= */}
        {/* 戻る */}
        {/* ================================= */}

        <Link
          href="/venues"
          className="
            text-[13px]
            font-medium
            text-[#14526B]
            transition
            hover:opacity-60
          "
        >
          ← VENUES
        </Link>

        {/* ================================= */}
        {/* 会場情報 */}
        {/* ================================= */}

        <section className="mt-7">

          <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400">
            VENUE
          </p>

          <h1
            className="
              mt-2
              break-words
              text-[26px]
              font-black
              leading-tight
              tracking-tight
              text-[#14526B]
            "
          >
            {venueName}
          </h1>

          <div className="mt-3 flex items-end gap-1.5">

            <span className="text-[22px] font-black leading-none text-[#14526B]">
              {venueLives.length}
            </span>

            <span className="text-[12px] text-zinc-400">
              公演
            </span>

          </div>

        </section>

        {/* ================================= */}
        {/* ライブ一覧 */}
        {/* ================================= */}

        <section className="mt-9">

          <div className="mb-2 flex items-center justify-between">

            <p className="text-[11px] font-bold tracking-[0.16em] text-zinc-400">
              LIVE
            </p>

            <p className="text-[11px] text-zinc-400">
              {venueLives.length}公演
            </p>

          </div>

          <div className="border-y border-zinc-200">

            {venueLives.map((live) => (
              <Link
                key={live.id}
                href={`/live/${live.id}`}
                className="
                  group
                  block
                  border-b
                  border-zinc-100
                  py-3
                  transition
                  last:border-b-0
                "
              >

                <div className="flex items-start">

                  {/* ライブ情報 */}

                  <div className="min-w-0 flex-1">

                    {/* 日付 */}

                    <p className="text-[10px] font-medium text-zinc-400">
                      {live.date}
                    </p>

                    {/* 公演タイトル */}

                    <h2
                      className="
                        mt-0.5
                        break-words
                        text-[13px]
                        font-bold
                        leading-[1.35]
                        text-[#14526B]
                        transition
                        group-hover:opacity-70
                      "
                    >
                      {live.title}
                    </h2>

                    {/* 都市 */}

                    {live.city && (
                      <p
                        className="
                          mt-1
                          text-[11px]
                          leading-snug
                          text-zinc-400
                        "
                      >
                        {live.city}
                      </p>
                    )}

                    {/* ツアー名 */}

                    {live.tour && (
                      <p
                        className="
                          mt-1
                          break-words
                          text-[10px]
                          leading-snug
                          text-zinc-400
                        "
                      >
                        {live.tour}
                      </p>
                    )}

                  </div>

                  {/* 矢印 */}

                  <span
                    className="
                      ml-4
                      mt-5
                      shrink-0
                      text-[12px]
                      text-zinc-300
                      transition
                      group-hover:translate-x-0.5
                      group-hover:text-[#14526B]
                    "
                  >
                    →
                  </span>

                </div>

              </Link>
            ))}

          </div>

        </section>

      </div>
    </main>
  );
}