
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type EventType = "fes" | "jisyukikaku" | "other";

type DbLive = {
  id: string;
  date: string;
  title: string;
  city: string;
  venue: string;
  tour: string | null;
  event_type: string | null;
  artists: string[] | null;
  address: string | null;
  setlist: string[] | null;
  encore: string[] | null;
  memo: string | null;
};

export default function AdminLivesPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [records, setRecords] = useState<DbLive[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [tour, setTour] = useState("");
  const [eventType, setEventType] = useState<EventType>("fes");
  const [artists, setArtists] = useState("");
  const [address, setAddress] = useState("");
  const [setlist, setSetlist] = useState("");
  const [encore, setEncore] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    const checkLogin = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/admin/login");
        return;
      }

      setChecking(false);
    };

    void checkLogin();
  }, [router]);

  const loadRecords = async () => {
    setLoadingRecords(true);
    setListError("");
    try {
      const result: DbLive[] = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error: fetchError } = await supabase
          .from("lives")
          .select("id,date,title,city,venue,tour,event_type,artists,address,setlist,encore,memo")
          .order("date", { ascending: false })
          .range(offset, offset + pageSize - 1);
        if (fetchError) throw fetchError;
        const page = (data ?? []) as DbLive[];
        result.push(...page);
        if (page.length < pageSize) break;
      }
      setRecords(result);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "一覧の取得に失敗しました。");
    } finally {
      setLoadingRecords(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDate("");
    setTitle("");
    setCity("");
    setVenue("");
    setTour("");
    setEventType("fes");
    setArtists("");
    setAddress("");
    setSetlist("");
    setEncore("");
    setMemo("");
  };

  const startEdit = (live: DbLive) => {
    setEditingId(live.id);
    setDate(live.date.replaceAll(".", "-"));
    setTitle(live.title);
    setCity(live.city);
    setVenue(live.venue);
    setTour(live.tour ?? "");
    setEventType(
      live.event_type === "jisyukikaku" || live.event_type === "other"
        ? live.event_type
        : "fes"
    );
    setArtists((live.artists ?? []).join("\n"));
    setAddress(live.address ?? "");
    setSetlist((live.setlist ?? []).join("\n"));
    setEncore((live.encore ?? []).join("\n"));
    setMemo(live.memo ?? "");
    setMessage("");
    setError("");
    document.getElementById("live-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (live: DbLive) => {
    if (!window.confirm(`「${live.title}」（${live.date}）を削除しますか？\nこの操作は元に戻せません。`)) return;
    setDeletingId(live.id);
    setListError("");
    try {
      const { data, error: deleteError } = await supabase
        .from("lives")
        .delete()
        .eq("id", live.id)
        .select("id");
      if (deleteError) throw deleteError;
      if (!data?.length) throw new Error("削除できませんでした。管理者権限を確認してください。");
      if (editingId === live.id) resetForm();
      await loadRecords();
    } catch (err) {
      setListError(err instanceof Error ? err.message : "削除に失敗しました。");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRecords = records.filter((live) =>
    [live.date, live.title, live.city, live.venue, live.tour ?? ""]
      .join(" ")
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase())
  );

  const toLines = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
       const payload = {
         date: date.replaceAll("-", "."),
         title: title.trim(),
         city: city.trim(),
         venue: venue.trim(),
         tour: tour.trim(),
         event_type: eventType,
         artists: toLines(artists),
         address: address.trim(),
         setlist: toLines(setlist),
         encore: toLines(encore),
         memo: memo.trim(),
       };

       if (editingId) {
         const { data, error: updateError } = await supabase
           .from("lives")
           .update(payload)
           .eq("id", editingId)
           .select("id");
         if (updateError) throw updateError;
         if (!data?.length) throw new Error("更新できませんでした。管理者権限を確認してください。");
         setMessage("ライブを更新しました！");
       } else {
         const { error: insertError } = await supabase
           .from("lives")
           .insert({ id: crypto.randomUUID(), ...payload });
         if (insertError) throw insertError;
         setMessage("ライブを登録しました！");
       }
       resetForm();
       await loadRecords();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "保存に失敗しました。"
      );
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#14526B]";

  const labelClass =
    "block text-xs font-semibold text-zinc-600";

  if (checking) {
    return (
      <main className="min-h-screen bg-white p-8 text-zinc-500">
        ログイン状態を確認中...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#14526B]">
              ADMIN
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#14526B]">
              LIVE MANAGER
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/admin"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-xs text-[#14526B]"
            >
              ADMIN MENU
            </Link>
            <Link
              href="/admin/upcoming"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-xs text-[#14526B]"
            >
              UPCOMING LIVE
            </Link>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/admin/login");
              }}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-500"
            >
              LOGOUT
            </button>
          </div>
        </div>

        <section id="live-form" className="mt-8 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-bold text-[#14526B]">
            NEW LIVE
          </h2>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            新しいライブ情報を登録します。
            曲名・出演者は1行につき1件入力してください。
          </p>

          {editingId && (
            <button type="button" onClick={() => { resetForm(); setError(""); setMessage(""); }}
              className="mt-4 rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600">
              編集をキャンセルして新規登録に戻る
            </button>
          )}
          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div>
              <label htmlFor="date" className={labelClass}>
                DATE *
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="title" className={labelClass}>
                TITLE *
              </label>
              <input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="公演名"
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className={labelClass}>
                  CITY *
                </label>
                <input
                  id="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="東京"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="venue" className={labelClass}>
                  VENUE *
                </label>
                <input
                  id="venue"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="shibuya eggman"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="tour" className={labelClass}>
                TOUR
              </label>
              <input
                id="tour"
                value={tour}
                onChange={(e) => setTour(e.target.value)}
                placeholder="ツアー名（任意）"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="eventType" className={labelClass}>
                EVENT TYPE
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) =>
                  setEventType(e.target.value as EventType)
                }
                className={fieldClass}
              >
                <option value="fes">フェス・対バン</option>
                <option value="jisyukikaku">自主企画・ワンマン</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="artists" className={labelClass}>
                ARTISTS
              </label>
              <textarea
                id="artists"
                rows={3}
                value={artists}
                onChange={(e) => setArtists(e.target.value)}
                placeholder={"対バン相手A\n対バン相手B"}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="address" className={labelClass}>
                ADDRESS
              </label>
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="会場住所（任意）"
                className={fieldClass}
              />
            </div>

            <div className="border-t border-zinc-200 pt-6">
              <label htmlFor="setlist" className={labelClass}>
                SETLIST
              </label>
              <p className="mt-1 text-xs text-zinc-400">
                演奏順に1行ずつ入力
              </p>
              <textarea
                id="setlist"
                rows={10}
                value={setlist}
                onChange={(e) => setSetlist(e.target.value)}
                placeholder={"癖\nアカネ\nメトロポリタン"}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="encore" className={labelClass}>
                ENCORE
              </label>
              <textarea
                id="encore"
                rows={3}
                value={encore}
                onChange={(e) => setEncore(e.target.value)}
                placeholder="アンコール曲を1行ずつ入力"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="memo" className={labelClass}>
                MEMO
              </label>
              <textarea
                id="memo"
                rows={4}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="リハーサル情報・備考など"
                className={fieldClass}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                保存エラー：{error}
              </p>
            )}

            {message && (
              <p role="status" className="text-sm font-semibold text-[#14526B]">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#14526B] px-4 py-4 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? "保存中..." : editingId ? "UPDATE LIVE" : "SAVE LIVE"}
            </button>
          </form>
        </section>

        <section className="mt-12 border-t border-zinc-200 pt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#14526B]">REGISTERED LIVES</h2>
            <button type="button" onClick={() => void loadRecords()}
              disabled={loadingRecords}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600 disabled:opacity-50">
              再読み込み
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Supabaseに登録された公演のみ表示します（{records.length}件）。
            data/lives.ts の公演は対象外です。
          </p>
          <input
            aria-label="登録済みライブを検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="日付・公演名・都市・会場・ツアーで検索"
            className={fieldClass + " mt-4"}
          />
          {listError && <p role="alert" className="mt-3 text-sm text-red-600">{listError}</p>}
          {loadingRecords && <p className="mt-4 text-sm text-zinc-500">一覧を読み込み中...</p>}
          {!loadingRecords && filteredRecords.length === 0 && (
            <p className="mt-4 text-sm text-zinc-500">該当する公演はありません。</p>
          )}
          <div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
            {filteredRecords.map((live) => (
              <div key={live.id} className="flex items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#14526B]">{live.date}</p>
                  <p className="mt-1 text-sm font-bold text-[#14526B]">{live.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{live.city} / {live.venue}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => startEdit(live)}
                    className="rounded-lg border border-[#14526B] px-3 py-2 text-xs font-semibold text-[#14526B]">
                    編集
                  </button>
                  <button type="button" onClick={() => void handleDelete(live)}
                    disabled={deletingId !== null || saving}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50">
                    {deletingId === live.id ? "削除中" : "削除"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
