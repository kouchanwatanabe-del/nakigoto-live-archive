"use client";

import { useRouter } from "next/navigation";

type Props = {
  color?: string;
};

export default function BackButton({
  color = "#14526B",
}: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="前のページに戻る"
      className="flex h-9 w-9 items-center justify-start text-3xl font-light leading-none transition-opacity hover:opacity-60"
      style={{ color }}
    >
      ‹
    </button>
  );
}