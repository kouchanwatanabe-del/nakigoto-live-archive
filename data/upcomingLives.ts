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
  artists: ["homme","カナタ"],
  memo: "",
},

{
  id: "2027-02-11-osaka",
  date: "2027.02.11",
  title: "【大阪】RGB ONEMAN TOUR2027",
  city: "大阪",
  venue: "Yogibo HOLY MOUNTAIN",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},
{
  id: "2027-02-13-hiroshima",
  date: "2027.02.13",
  title: "【広島】RGB ONEMAN TOUR2027",
  city: "広島",
  venue: "広島ALMIGHTY",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},
{
  id: "2027-02-27-okayama",
  date: "2027.02.27",
  title: "【岡山】RGB ONEMAN TOUR2027",
  city: "岡山",
  venue: "CRAZYMAMA 2ndroom",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},
{
  id: "2027-02-28-aichi",
  date: "2027.02.28",
  title: "【愛知】RGB ONEMAN TOUR2027",
  city: "愛知",
  venue: "ell.FITS ALL",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},
{
  id: "2027-03-06-kagawa",
  date: "2027.03.06",
  title: "【香川】RGB ONEMAN TOUR2027",
  city: "香川",
  venue: "高松TOONICE",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},
{
  id: "2027-03-07-fukuoka",
  date: "2027.03.07",
  title: "【福岡】RGB ONEMAN TOUR2027",
  city: "福岡",
  venue: "福岡OP’s",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},
{
  id: "2027-03-22-niigata",
  date: "2027.03.22",
  title: "【新潟】RGB ONEMAN TOUR2027",
  city: "新潟",
  venue: "新潟GOLDEN PIGS BLACK",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},
{
  id: "2027-04-03-hokkaido",
  date: "2027.04.03",
  title: "【北海道】RGB ONEMAN TOUR2027",
  city: "北海道",
  venue: "SPIRITUAL LOUNGE",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},
{
  id: "2027-04-04-miyagi",
  date: "2027.04.04",
  title: "【宮城】RGB ONEMAN TOUR2027",
  city: "宮城",
  venue: "enn2nd",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},
{
  id: "2027-04-11-tokyo",
  date: "2027.04.11",
  title: "【東京】RGB ONEMAN TOUR2027",
  city: "東京",
  venue: "恵比寿LIQUIDROOM",
  tour: "RGB ONEMAN TOUR2027",
  memo: "",
},



];

