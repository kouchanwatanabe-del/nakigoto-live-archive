"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type UpcomingRecord = {
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

type FormData = {
  date: string;
  title: string;
  city: string;
  venue: string;
  tour: string;
  open: string;
  start: string;
  artists: string;
  address: string;
  memo: string;
  mapUrl: string;
};

const emptyForm: FormData = {
  date: "", title: "", city: "", venue: "", tour: "",
  open: "", start: "", artists: "", address: "", memo: "", mapUrl: "",
};

const inputClass = "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-[#14526B]";
const labelClass = "block text-xs font-semibold text-zinc-600";

export default function AdminUpcomingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [records, setRecords] = useState<UpcomingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const all: UpcomingRecord[] = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error: fetchError } = await supabase
          .from("upcoming_lives")
          .select("id,date,title,city,venue,tour,open,start,artists,address,memo,map_url")
          .order("date", { ascending: true })
          .range(offset, offset + pageSize - 1);
        if (fetchError) throw fetchError;
        const page = (data ?? []) as UpcomingRecord[];
        all.push(...page);
        if (page.length < pageSize) break;
      }
      setRecords(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : "一覧を取得できませんでした。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !data.user) {
        router.replace("/admin/login");
        return;
      }
      setChecking(false);
      void loadRecords();
    }
    void init();
    return () => { active = false; };
  }, [router, loadRecords]);

  const updateField = (key: keyof FormData, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const editRecord = (live: UpcomingRecord) => {
    setEditingId(live.id);
    setForm({
      date: live.date.replaceAll(".", "-"),
      title: live.title,
      city: live.city,
      venue: live.venue,
      tour: live.tour ?? "",
      open: live.open ?? "",
      start: live.start ?? "",
      artists: (live.artists ?? []).join("\n"),
      address: live.address ?? "",
      memo: live.memo ?? "",
      mapUrl: live.map_url ?? "",
    });
    setError("");
    setMessage("");
    document.getElementById("upcoming-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const payload = {
        date: form.date.replaceAll("-", "."),
        title: form.title.trim(),
        city: form.city.trim(),
        venue: form.venue.trim(),
        tour: form.tour.trim(),
        open: form.open.trim() || null,
        start: form.start.trim() || null,
        artists: form.artists.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
        address: form.address.trim() || null,
        memo: form.memo.trim(),
        map_url: form.mapUrl.trim() || null,
      };
      if (editingId) {
        const { data, error: updateError } = await supabase.from("upcoming_lives")
          .update(payload).eq("id", editingId).select("id");
        if (updateError) throw updateError;
        if (!data?.length) throw new Error("更新できませんでした。権限を確認してください。");
        setMessage("公演情報を更新しました。");
      } else {
        const { error: insertError } = await supabase.from("upcoming_lives")
          .insert({ id: crypto.randomUUID(), ...payload });
        if (insertError) throw insertError;
        setMessage("公演を登録しました。");
      }
      resetForm();
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (live: UpcomingRecord) => {
    if (!window.confirm(`「${live.title}」（${live.date}）を削除しますか？\n元に戻せません。`)) return;
    setDeletingId(live.id);
    setError("");
    setMessage("");
    try {
      const { data, error: deleteError } = await supabase.from("upcoming_lives")
        .delete().eq("id", live.id).select("id");
      if (deleteError) throw deleteError;
      if (!data?.length) throw new Error("削除できませんでした。権限を確認してください。");
      if (editingId === live.id) resetForm();
      setMessage("公演を削除しました。");
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました。");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => records.filter((live) =>
    [live.date, live.title, live.city, live.venue, live.tour ?? ""]
      .join(" ").toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  ), [records, search]);

  if (checking) return <main className="min-h-screen bg-white p-8 text-zinc-500">ログイン状態を確認中...</main>;

  return (
    <main className="min-h-screen bg-white px-4 pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#14526B]">ADMIN</p>
            <h1 className="mt-2 text-2xl font-bold text-[#14526B]">UPCOMING LIVE MANAGER</h1>
          </div>
          <Link href="/admin/lives" className="rounded-xl border border-zinc-200 px-3 py-2 text-xs text-[#14526B]">LIVE MANAGER</Link>
        </div>

        <section id="upcoming-form" className="mt-8 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-bold text-[#14526B]">{editingId ? "EDIT UPCOMING LIVE" : "NEW UPCOMING LIVE"}</h2>
          <p className="mt-2 text-xs text-zinc-500">出演者は1行につき1組入力してください。</p>
          {editingId && <button type="button" onClick={() => { resetForm(); setError(""); setMessage(""); }} className="mt-4 rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600">編集をキャンセル</button>}
          <form onSubmit={save} className="mt-6 space-y-5">
            <div><label htmlFor="date" className={labelClass}>DATE *</label><input id="date" type="date" required value={form.date} onChange={(e) => updateField("date", e.target.value)} className={inputClass}/></div>
            <div><label htmlFor="title" className={labelClass}>TITLE *</label><input id="title" required value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="公演名" className={inputClass}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="city" className={labelClass}>CITY *</label><input id="city" required value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="東京" className={inputClass}/></div>
              <div><label htmlFor="venue" className={labelClass}>VENUE *</label><input id="venue" required value={form.venue} onChange={(e) => updateField("venue", e.target.value)} placeholder="shibuya eggman" className={inputClass}/></div>
            </div>
            <div><label htmlFor="tour" className={labelClass}>TOUR</label><input id="tour" value={form.tour} onChange={(e) => updateField("tour", e.target.value)} className={inputClass}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="open" className={labelClass}>OPEN</label><input id="open" type="time" value={form.open} onChange={(e) => updateField("open", e.target.value)} className={inputClass}/></div>
              <div><label htmlFor="start" className={labelClass}>START</label><input id="start" type="time" value={form.start} onChange={(e) => updateField("start", e.target.value)} className={inputClass}/></div>
            </div>
            <div><label htmlFor="artists" className={labelClass}>ARTISTS（1行1組）</label><textarea id="artists" rows={4} value={form.artists} onChange={(e) => updateField("artists", e.target.value)} placeholder={"バンドA\nバンドB"} className={inputClass}/></div>
            <div><label htmlFor="address" className={labelClass}>ADDRESS</label><input id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass}/></div>
            <div><label htmlFor="mapUrl" className={labelClass}>MAP URL（任意）</label><input id="mapUrl" type="url" value={form.mapUrl} onChange={(e) => updateField("mapUrl", e.target.value)} placeholder="https://..." className={inputClass}/></div>
            <div><label htmlFor="memo" className={labelClass}>MEMO</label><textarea id="memo" rows={4} value={form.memo} onChange={(e) => updateField("memo", e.target.value)} className={inputClass}/></div>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {message && <p role="status" className="text-sm font-semibold text-[#14526B]">{message}</p>}
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-[#14526B] px-4 py-4 text-sm font-bold text-white disabled:opacity-50">{saving ? "保存中..." : editingId ? "UPDATE UPCOMING LIVE" : "SAVE UPCOMING LIVE"}</button>
          </form>
        </section>

        <section className="mt-12 border-t border-zinc-200 pt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#14526B]">REGISTERED UPCOMING LIVES</h2>
            <button type="button" onClick={() => void loadRecords()} disabled={loading} className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600 disabled:opacity-50">再読み込み</button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">Supabaseに登録した公演のみ表示します（{records.length}件）。</p>
          <input aria-label="公演を検索" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="日付・公演名・都市・会場で検索" className={`${inputClass} mt-4`}/>
          {loading && <p className="mt-4 text-sm text-zinc-500">読み込み中...</p>}
          {!loading && filtered.length === 0 && <p className="mt-4 text-sm text-zinc-500">該当する公演はありません。</p>}
          <div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
            {filtered.map((live) => (
              <div key={live.id} className="flex items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#14526B]">{live.date}</p>
                  <p className="mt-1 text-sm font-bold text-[#14526B]">{live.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{live.city} / {live.venue}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => editRecord(live)} className="rounded-lg border border-[#14526B] px-3 py-2 text-xs font-semibold text-[#14526B]">編集</button>
                  <button type="button" onClick={() => void remove(live)} disabled={deletingId !== null || saving} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50">{deletingId === live.id ? "削除中" : "削除"}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
