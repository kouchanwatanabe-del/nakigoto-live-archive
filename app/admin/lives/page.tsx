
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLivesPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

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
  

  if (checking) {
    return (
      <main className="min-h-screen bg-white p-8 text-zinc-500">
        ログイン状態を確認中...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-28 text-zinc-900">
      <div className="mx-auto max-w-3xl pt-10">
        <h1 className="text-2xl font-bold text-[#14526B]">
          LIVE MANAGER
        </h1>

        <p className="mt-4 text-sm text-zinc-500">
          ログインできました。ここにライブ管理機能を追加します。
        </p>

        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/admin/login");
          }}
          className="mt-8 rounded-xl border border-zinc-200 px-4 py-3 text-sm text-[#14526B]"
        >
          LOGOUT
        </button>
      </div>
    </main>
  );

}
