
import { lives as localLives } from "../data/lives";
import { supabase } from "./supabase";

export type Live = {
  id: string;
  date: string;
  title: string;
  city: string;
  venue: string;
  tour: string;
  eventType: string;
  artists: string[];
  setlist: string[];
  encore: string[];
  address: string;
  memo: string;
};

type DatabaseLive = {
  id: string;
  date: string;
  title: string;
  city: string;
  venue: string;
  tour: string;
  event_type: string;
  artists: string[] | null;
  setlist: string[] | null;
  encore: string[] | null;
  address: string;
  memo: string;
};

const originalLives: Live[] = localLives.map((live) => ({
  id: live.id,
  date: live.date,
  title: live.title,
  city: live.city,
  venue: live.venue,
  tour: live.tour ?? "",
  eventType: live.eventType ?? "",
  artists: "artists" in live && Array.isArray(live.artists)
    ? [...live.artists]
    : [],
  setlist: "setlist" in live && Array.isArray(live.setlist)
    ? [...live.setlist]
    : [],
  encore: "encore" in live && Array.isArray(live.encore)
    ? [...live.encore]
    : [],
  address: "address" in live && typeof live.address === "string"
    ? live.address
    : "",
  memo: live.memo ?? "",
}));

export async function getAllLives(): Promise<Live[]> {
  const { data, error } = await supabase
    .from("lives")
    .select("*");

  if (error) {
    throw new Error(`ライブ取得エラー: ${error.message}`);
  }

  const databaseLives: Live[] = (
    (data ?? []) as DatabaseLive[]
  ).map((live) => ({
    id: live.id,
    date: live.date,
    title: live.title,
    city: live.city,
    venue: live.venue,
    tour: live.tour ?? "",
    eventType: live.event_type ?? "",
    artists: live.artists ?? [],
    setlist: live.setlist ?? [],
    encore: live.encore ?? [],
    address: live.address ?? "",
    memo: live.memo ?? "",
  }));

  // 同じIDがある場合はSupabaseのデータを優先
  const merged = new Map<string, Live>();

  originalLives.forEach((live) => merged.set(live.id, live));
  databaseLives.forEach((live) => merged.set(live.id, live));

  return [...merged.values()].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
}
