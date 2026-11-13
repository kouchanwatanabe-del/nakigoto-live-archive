import { supabase } from "./supabase";
import { upcomingLives, type UpcomingLive } from "../data/upcomingLives";

type UpcomingLiveRow = {
  id: string;
  date: string;
  title: string;
  city: string;
  venue: string;
  tour: string | null;
  open: string | null;
  start: string | null;
  artists: string[] | null;
  address: string | null;
  memo: string | null;
  map_url: string | null;
};

function fromRow(row: UpcomingLiveRow): UpcomingLive {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    city: row.city,
    venue: row.venue,
    tour: row.tour ?? "",
    ...(row.open ? { open: row.open } : {}),
    ...(row.start ? { start: row.start } : {}),
    ...(row.artists?.length ? { artists: row.artists } : {}),
    ...(row.address ? { address: row.address } : {}),
    memo: row.memo ?? "",
    ...(row.map_url ? { mapUrl: row.map_url } : {}),
  };
}

/**
 * 静的な公演データとSupabaseの公演データを統合します。
 * 同じIDがある場合はSupabase側を優先します。
 * 取得失敗時は例外を投げるため、呼び出し側でエラー表示してください。
 */
export async function getAllUpcomingLives(): Promise<UpcomingLive[]> {
  const rows: UpcomingLiveRow[] = [];
  const pageSize = 500;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("upcoming_lives")
      .select("id,date,title,city,venue,tour,open,start,artists,address,memo,map_url")
      .order("date", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    const page = (data ?? []) as UpcomingLiveRow[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  const byId = new Map<string, UpcomingLive>();
  for (const live of upcomingLives) byId.set(live.id, live);
  for (const row of rows) byId.set(row.id, fromRow(row));

  return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
}
