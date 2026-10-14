import Link from "next/link";
import { notFound } from "next/navigation";
import { schedules, findRecurringSchedule, type ScheduleCategory } from "../../../data/schedules";
import BackButton from "../../../components/BackButton";

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
        <BackButton />

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
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#14526B] hover:underline"
              >
                関連サイトを見る
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 5h6v6" />
                  <path d="m19 5-9 9" />
                  <path d="M19 13v6H5V5h6" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
