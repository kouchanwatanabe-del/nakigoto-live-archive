
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
];
