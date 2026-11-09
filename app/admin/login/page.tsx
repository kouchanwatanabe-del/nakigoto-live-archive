
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      setError(`ログインに失敗しました：${error.message}`);
      return;
    }

    router.replace("/admin/lives");
  };

  return (
    <main className="min-h-screen bg-white px-4 pb-28 text-zinc-900">
      <div className="mx-auto max-w-md pt-16">
        <p className="text-xs font-bold tracking-[0.15em] text-[#14526B]">
          NAKIGOTO UNOFFICIAL FANSITE
        </p>

        <h1 className="mt-3 text-2xl font-bold text-[#14526B]">
          ADMIN LOGIN
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          管理者アカウントでログインしてください。
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-zinc-600"
            >
              EMAIL
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#14526B]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-zinc-600"
            >
              PASSWORD
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-[#14526B]"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#14526B] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "LOGIN"}
          </button>
        </form>
      </div>
    </main>
  );
}
