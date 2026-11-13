"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminMenuPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const checkLogin = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        router.replace("/admin/login");
        return;
      }
      setChecking(false);
    };
    void checkLogin();
    return () => { active = false; };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-white p-8 text-sm text-zinc-500">
        ログイン状態を確認中...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#14526B]">ADMIN</p>
            <h1 className="mt-2 text-2xl font-bold text-[#14526B]">ADMIN MENU</h1>
            <p className="mt-3 text-sm text-zinc-500">
              管理するライブ情報を選択してください。
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="shrink-0 rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-500"
          >
            LOGOUT
          </button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/lives"
            className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-[#14526B] hover:bg-zinc-50"
          >
            <p className="text-xs font-bold tracking-widest text-[#14526B]">01 / ARCHIVE</p>
            <h2 className="mt-3 text-xl font-bold text-[#14526B]">LIVE MANAGER</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              過去のライブ情報やセットリストの登録・編集・削除
            </p>
            <p className="mt-6 text-sm font-semibold text-[#14526B]">管理画面を開く →</p>
          </Link>

          <Link
            href="/admin/upcoming"
            className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-[#14526B] hover:bg-zinc-50"
          >
            <p className="text-xs font-bold tracking-widest text-[#14526B]">02 / SCHEDULE</p>
            <h2 className="mt-3 text-xl font-bold text-[#14526B]">UPCOMING LIVE</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              今後の公演予定の登録・編集・削除
            </p>
            <p className="mt-6 text-sm font-semibold text-[#14526B]">管理画面を開く →</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
