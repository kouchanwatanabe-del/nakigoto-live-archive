import Link from "next/link";
import { lives } from "../data/lives";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">

        {/* 左側 */}
        <div className="flex min-w-0 items-center gap-4">

          {/* UNOFFICIAL */}
          <span className="hidden whitespace-nowrap text-[9px] font-medium tracking-[0.28em] text-zinc-400 sm:block">
            UNOFFICIAL LIVE ARCHIVE
          </span>

          {/* なきごと */}
          <Link
            href="/"
            className="shrink-0 text-xl font-bold text-[#14526B] transition-opacity hover:opacity-70"
          >
            なきごと
          </Link>

          {/* 説明 */}
          <span className="hidden truncate text-xs text-zinc-500 md:block">
            過去ライブ・セットリスト・ツアー記録
          </span>

        </div>

        {/* 右側 */}
        <div className="ml-4 flex shrink-0 items-center gap-2">

          <span className="hidden text-xs text-zinc-400 sm:inline">
            掲載ライブ
          </span>

          <span className="text-2xl font-bold leading-none text-[#14526B]">
            {lives.length}
          </span>

          <span className="text-xs text-zinc-500">
            公演
          </span>

        </div>

      </div>
    </header>
  );
}