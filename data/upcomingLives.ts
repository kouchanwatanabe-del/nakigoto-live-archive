// 未来の公演をここに追加してください。日付は YYYY.MM.DD 形式。
// id は公演ごとに重複しない文字列にしてください。
export type UpcomingLive = {
  id: string;
  date: string;
  title: string;
  city: string;
  venue: string;
  tour: string;
  memo: string;
  artists?: string[];
};

export const upcomingLives: UpcomingLive[] = [
  // 例：
  // {
  //   id: "2026-11-15-example",
  //   date: "2026.11.15",
  //   title: "公演タイトル",
  //   city: "東京",
  //   venue: "会場名",
  //   tour: "",
  //   memo: "",
  // },
  {
  id: "2026-10-12-example",
  date: "2026.10.11",
  title: "Maxell presents FM802 MINAMI WHEEL 2026",
  city: "大阪",
  venue: "Live House ANIMA",
  tour: "",
  memo: "",
},

];

