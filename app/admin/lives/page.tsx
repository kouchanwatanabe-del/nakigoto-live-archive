
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type EventType = "fes" | "jisyukikaku" | "other";

export default function AdminLivesPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
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
      // 既存の公演IDと衝突しにくいUUIDを使用
      const id = crypto.randomUUID();

      const { error: insertError } = await supabase
        .from("lives")
        .insert({
          id,
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
        });

      if (insertError) {
        throw insertError;
      }

      setMessage("ライブを登録しました！");

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

        <section className="mt-8 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-bold text-[#14526B]">
            NEW LIVE
          </h2>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            新しいライブ情報を登録します。
            曲名・出演者は1行につき1件入力してください。
          </p>

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
              {saving ? "保存中..." : "SAVE LIVE"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
