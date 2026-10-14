export type ScheduleCategory = "LIVE" | "RADIO" | "PODCAST" | "RELEASE" | "OTHER";

export type Schedule = {
  id: string;
  date: string;
  category: ScheduleCategory;
  title: string;
  time?: string;
  detail?: string;
  url?: string;
};

// 単発の予定はここに追加
export const schedules: Schedule[] = [
  {
    id: "2026-10-15-meminor",
    date: "2026.10.15",
    category: "OTHER",
    title: "ミーマイナー 東名阪対バンツアー「紀元前」開催記念！🔥",
    time: "18:00〜",
    detail: "Instagram Live｜18:00 あたらよ / 18:30 なきごと",
    url: "https://www.instagram.com/meminor_band/",
  },
];

// 定期番組の内容はここで一元管理
const regularPrograms = {
  ubugoe: {
    category: "PODCAST",
    title: 'Artistspoken「なきごとのUBUGOE」',
    time: "23:00",
    url: "https://artistspoken.com/lp/",
  },
  "wear-music": {
    category: "RADIO",
    title: 'ZIP-FM「WEAR MUSIC」',
    time: "25:30〜26:00",
  },
} satisfies Record<string, Pick<Schedule, "category" | "title" | "time" | "url">>;

function formatScheduleDate(year: number, month: number, day: number) {
  return `${year}.${String(month + 1).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

// 1か月分の定期番組を自動生成（同じIDで詳細ページにも遷移）
export function getRecurringSchedules(year: number, month: number): Schedule[] {
  const result: Schedule[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = new Date(year, month, day).getDay();
    const date = formatScheduleDate(year, month, day);

    if (weekday === 5) {
      result.push({ id: `ubugoe-${date}`, date, ...regularPrograms.ubugoe });
    }

    if (weekday === 3 && (Math.ceil(day / 7) === 2 || Math.ceil(day / 7) === 4)) {
      result.push({ id: `wear-music-${date}`, date, ...regularPrograms["wear-music"] });
    }
  }
  return result;
}

// 定期番組の詳細ページ用：日付から対象の予定を探す
export function findRecurringSchedule(id: string): Schedule | undefined {
  if (id === "ubugoe") {
    return { id, date: "", ...regularPrograms.ubugoe };
  }

  const match = /^(ubugoe|wear-music)-(\d{4})\.(\d{2})\.(\d{2})$/.exec(id);
  if (!match) return undefined;

  const year = Number(match[2]);
  const month = Number(match[3]) - 1;
  const day = Number(match[4]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return undefined;

  return getRecurringSchedules(year, month).find((item) => item.id === id);
}
