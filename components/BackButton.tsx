"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="前のページに戻る"
      className="flex h-9 w-9 items-center justify-start text-3xl font-light leading-none text-[#14526B] transition-opacity hover:opacity-60"
    >
      ‹
    </button>
  );
}