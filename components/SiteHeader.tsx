import Link from "next/link";
import { lives } from "../data/lives";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">

        {/* 左側 */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">

          {/* スマホでも表示 */}
          <span className="shrink-0 text-[7px] font-medium uppercase tracking-[0.18em] text-zinc-400 sm:text-[9px] sm:tracking-[0.25em]">
            UNOFFICIAL LIVE ARCHIVE
          </span>

          {/* なきごと */}
          <Link
            href="/"
            className="shrink-0 text-[19px] font-black leading-none tracking-tight text-[#14526B] transition-opacity hover:opacity-70 sm:text-[22px]"
          >
            なきごと
          </Link>

          {/* PC・タブレットのみ */}
          <span className="hidden truncate text-[11px] text-zinc-500 md:block">
            過去ライブ・セットリスト記録
          </span>

        </div>

        {/* 右側 */}
        <div className="ml-3 flex shrink-0 items-center gap-1.5 sm:gap-2">

          {/* スマホでは非表示 */}
          <span className="hidden text-[10px] font-medium text-zinc-400 sm:inline">
            掲載ライブ
          </span>

          <span className="text-[21px] font-black leading-none text-[#14526B] sm:text-[24px]">
            {lives.length}
          </span>

          <span className="text-[9px] font-medium text-zinc-500 sm:text-[11px]">
            公演
          </span>

        </div>

      </div>
    </header>
  );
}