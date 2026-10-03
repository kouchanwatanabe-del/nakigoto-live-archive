import Link from "next/link";
import { lives } from "../data/lives";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#14526B]">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">

        {/* 左側 */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">

          {/* サイト名 */}
          <Link
            href="/"
            className="shrink-0 text-[19px] font-black leading-none tracking-tight text-white transition-opacity hover:opacity-70 sm:text-[22px]"
          >
            なきごと
          </Link>

          {/* 非公式表記 */}
          <span className="shrink-0 text-[7px] font-medium uppercase tracking-[0.18em] text-white/55 sm:text-[9px] sm:tracking-[0.25em]">
            UNOFFICIAL LIVE LOG
          </span>

          {/* 説明 */}
          <span className="hidden truncate text-[11px] text-white/65 md:block">
            過去ライブ・セットリスト記録
          </span>

        </div>

        {/* 右側 */}
        <div className="ml-3 flex shrink-0 items-center gap-1.5 sm:gap-2">

          <span className="hidden text-[10px] font-medium text-white/55 sm:inline">
            掲載ライブ
          </span>

          <span className="text-[21px] font-black leading-none text-white sm:text-[24px]">
            {lives.length}
          </span>

          <span className="text-[9px] font-medium text-white/65 sm:text-[11px]">
            公演
          </span>

        </div>

      </div>
    </header>
  );
}