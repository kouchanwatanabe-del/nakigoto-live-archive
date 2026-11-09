
import { lives as localLives } from "../data/lives";
import { supabase } from "./supabase";

// ========================================
// ライブ情報の共通型
// ========================================

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
  excludeFromSongHistory?: boolean;
};

// ========================================
// Supabaseのデータ型
// ========================================

type DatabaseLive = {
  id: string;
  date: string;
  title: string;
  city: string;
  venue: string;
  tour: string | null;
  event_type: string | null;
  artists: string[] | null;
  setlist: string[] | null;
  encore: string[] | null;
  address: string | null;
  memo: string | null;
};

// ========================================
// 既存の lives.ts を共通形式に変換
// ========================================

const originalLives: Live[] = localLives.map((live) => ({
  id: live.id,
  date: live.date,
  title: live.title,
  city: live.city,
  venue: live.venue,
  tour: live.tour ?? "",
  eventType: live.eventType ?? "",

  artists:
    "artists" in live && Array.isArray(live.artists)
      ? [...live.artists]
      : [],

  setlist:
    "setlist" in live && Array.isArray(live.setlist)
      ? [...live.setlist]
      : [],

  encore:
    "encore" in live && Array.isArray(live.encore)
      ? [...live.encore]
      : [],

  address:
    "address" in live && typeof live.address === "string"
      ? live.address
      : "",

  memo: live.memo ?? "",

  // SONGSの演奏履歴から除外する設定を維持
  excludeFromSongHistory:
    "excludeFromSongHistory" in live &&
    live.excludeFromSongHistory === true,
}));

// ========================================
// 既存データ + Supabaseデータを取得
// ========================================

export async function getAllLives(): Promise<Live[]> {
  const { data, error } = await supabase
    .from("lives")
    .select("*");

  if (error) {
    throw new Error(
      `ライブ取得エラー: ${error.message}`
    );
  }

  // ========================================
  // Supabaseデータを共通形式に変換
  // ========================================

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

    // Supabase側は現時点では除外設定なし
    excludeFromSongHistory: false,
  }));

  // ========================================
  // 既存データとSupabaseデータを統合
  // ========================================

  const merged = new Map<string, Live>();

  // 既存データを登録
  originalLives.forEach((live) => {
    merged.set(live.id, live);
  });

  // Supabaseデータを追加
  // 同じIDの場合はSupabase側を優先
  databaseLives.forEach((live) => {
    merged.set(live.id, live);
  });

  // ========================================
  // 日付の新しい順に並び替え
  // ========================================

  return [...merged.values()].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
}
