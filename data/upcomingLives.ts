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
  //   artists: [
  //   "バンドA",
  //   "バンドB",
  //   ],
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
{
  id: "2026-10-17-example",
  date: "2026.10.17",
  title: "murffin discs 20th Anniversary “murffin Carnival!!” 前夜祭",
  city: "東京",
  venue: "shibuya eggman",
  tour: "",
  memo: "osageとのコラボステージ",
},
{
  id: "2026-10-18-example",
  date: "2026.10.18",
  title: "murffin discs 20th Anniversary “murffin Carnival!!”",
  city: "東京",
  venue: "国立代々木競技場 第一体育館",
  tour: "",
  memo: "SCRAMBLE STAGE",
},
{
  id: "2026-10-24-example",
  date: "2026.10.24",
  title: "【広島】MUSIC YOKAJA Vol.1",
  city: "広島",
  venue: "Live spece Read",
  tour: "",
  artists: ["バチカン市国に愛されたい", "ミーマイナー"],
  memo: "",
},
{
  id: "2026-10-25-example",
  date: "2026.10.25",
  title: "【福岡】MUSIC YOKAJA Vol.1",
  city: "福岡",
  venue: "福岡BEAT STATION",
  tour: "",
  artists: ["バチカン市国に愛されたい", "ミーマイナー"],
  memo: "",
},
{
  id: "2026-11-05-example",
  date: "2026.11.05",
  title: "ミーマイナー東名阪対バンツアー ”紀元前”",
  city: "東京",
  venue: " SHIBUYA CLUB QUATTRO",
  tour: "",
  artists: ["ミーマイナー", "あたらよ"],
  memo: "",
},
{
  id: "2026-12-10-example",
  date: "2026.12.10",
  title: 'Zeela 13周年記念企画"VS"',
  city: "大阪",
  venue: "梅田Zeela",
  tour: "",
  artists: ["Bray me"],
  memo: "",
},
{
  id: "2026-12-19-example",
  date: "2026.12.19",
  title: 'やすぎシグナスフェスティバル',
  city: "島根",
  venue: "安来節演芸館",
  tour: "",
  artists: ["Bray me"],
  memo: "",
},
];

