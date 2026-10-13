
export type ScheduleCategory =
  | "LIVE"
  | "RADIO"
  | "PODCAST"
  | "RELEASE"
  | "OTHER";

export type Schedule = {
  id: string;
  date: string;
  category: ScheduleCategory;
  title: string;
  time?: string;
  detail?: string;
  url?: string;
};

export const schedules: Schedule[] = [
  // RADIO・PODCAST・RELEASE・OTHERの予定を
  // ここに追加していく
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
