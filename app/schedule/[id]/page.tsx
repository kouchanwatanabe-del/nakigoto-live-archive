import Link from "next/link";
import { notFound } from "next/navigation";
import { schedules, findRecurringSchedule, type ScheduleCategory } from "../../../data/schedules";

type PageProps = {
  params: Promise<{ id: string }>;
};

const categoryColors: Record<ScheduleCategory, { bg: string; text: string }> = {
  LIVE: { bg: "#14526B", text: "#FFFFFF" },
  RADIO: { bg: "#E5EDF1", text: "#557889" },
  PODCAST: { bg: "#EEEAF3", text: "#817995" },
  RELEASE: { bg: "#E4EFEB", text: "#527C72" },
  OTHER: { bg: "#EFEEEB", text: "#77746E" },
};

export default async function ScheduleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = schedules.find((item) => item.id === id) ?? findRecurringSchedule(id);

  if (!event) notFound();

  const color = categoryColors[event.category];

  return (
    <main className="min-h-screen bg-white pb-28 text-[#14526B]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#14526B]"
        >
          <span aria-hidden="true">‹</span> SCHEDULEに戻る
        </Link>

        <div className="mt-8 border-b border-zinc-200 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            {event.date && <span className="text-xs font-bold">{event.date}</span>}
            <span
              className="rounded-[3px] px-2 py-1 text-[10px] font-bold"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {event.category}
            </span>
          </div>
          <h1 className="mt-4 text-xl font-bold leading-relaxed sm:text-2xl">
            {event.title}
          </h1>
        </div>

        <div className="divide-y divide-zinc-100">
          {event.time && (
            <div className="py-5">
              <p className="text-[11px] font-bold tracking-wide text-zinc-400">TIME</p>
              <p className="mt-2 text-sm font-semibold">{event.time}</p>
            </div>
          )}

          {event.detail && (
            <div className="py-5">
              <p className="text-[11px] font-bold tracking-wide text-zinc-400">DETAIL</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-zinc-700">
                {event.detail}
              </p>
            </div>
          )}

          {event.url && (
            <div className="py-6">
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-[#14526B] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                関連サイトを見る ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
