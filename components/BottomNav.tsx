"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  CalendarDays,
  Music2,
  Heart,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/",
      label: "HOME",
      icon: House,
    },
    {
      href: "/lives",
      label: "LIVE",
      icon: CalendarDays,
    },
    {
      href: "/songs",
      label: "SONGS",
      icon: Music2,
    },
    {
      href: "/collection",
      label: "COLLECTION",
      icon: Heart,
    },
  ];

  const handleTabClick = (active: boolean) => {
    if (active) return;

    sessionStorage.setItem(
      "bottomNavScrollPosition",
      String(window.scrollY)
    );

    sessionStorage.setItem(
      "bottomNavTabTransition",
      "true"
    );

    sessionStorage.removeItem(
      "liveShouldRestoreScroll"
    );

    sessionStorage.removeItem(
      "songShouldRestoreScroll"
    );
  };

  return (
    <nav
      className="
        fixed
        bottom-3
        left-1/2
        z-50
        w-[92%]
        max-w-sm
        -translate-x-1/2
      "
    >
      {/* ガラス本体 */}
      <div
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-white/80
          bg-white/55
          p-1.5
          shadow-[0_8px_30px_rgba(20,82,107,0.16),inset_0_1px_0_rgba(255,255,255,0.95)]
          backdrop-blur-2xl
        "
      >
        {/* 水色のぼかし */}
        <div
          className="
            pointer-events-none
            absolute
            -bottom-8
            -left-6
            h-20
            w-44
            rounded-full
            bg-sky-300/30
            blur-2xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-20
            w-40
            rounded-full
            bg-cyan-200/25
            blur-2xl
          "
        />

        {/* 上部の光 */}
        <div
          className="
            pointer-events-none
            absolute
            left-5
            right-5
            top-[2px]
            h-[1px]
            bg-gradient-to-r
            from-transparent
            via-white
            to-transparent
          "
        />

        {/* タブ */}
        <div className="relative z-10 grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const active =
              tab.href === "/"
                ? pathname === "/"
                : tab.href === "/lives"
                  ? pathname === "/lives" ||
                    pathname.startsWith("/live/")
                  : tab.href === "/collection"
                    ? pathname.startsWith(
                        "/collection"
                      ) ||
                      pathname.startsWith("/stats")
                    : pathname.startsWith(
                        tab.href
                      );

            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                scroll={false}
                onClick={() =>
                  handleTabClick(active)
                }
                className={`
                  relative
                  flex
                  min-h-[58px]
                  flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-[22px]
                  py-1.5
                  transition-all
                  duration-300

                  ${active
  ? "scale-[1.03] text-[#14526B]"
  : "text-zinc-400 hover:text-[#14526B]"
}
                `}
              >
                {/* 選択中の水滴 */}
                {active && (
  <>
    {/* 選択中の水のかたまり */}
    <div
      className="
        absolute
        inset-0
        rounded-[22px]
        border
        border-[#14526B]/20
        bg-gradient-to-br
        from-sky-300/70
        via-cyan-200/55
        to-sky-100/45
        shadow-[
          inset_0_2px_4px_rgba(255,255,255,0.95),
          inset_0_-4px_10px_rgba(14,165,233,0.12),
          0_5px_14px_rgba(20,82,107,0.18)
        ]
        backdrop-blur-xl
      "
    />

    {/* 上側の反射 */}
    <div
      className="
        absolute
        left-[15%]
        top-[4px]
        h-[8px]
        w-[55%]
        rounded-full
        bg-white/80
        blur-[2px]
      "
    />

    {/* 下側に溜まった水色 */}
    <div
      className="
        absolute
        -bottom-4
        left-1/2
        h-9
        w-[80%]
        -translate-x-1/2
        rounded-full
        bg-sky-400/30
        blur-xl
      "
    />

    {/* 小さい光 */}
    <div
      className="
        absolute
        right-[14%]
        top-[12px]
        h-2
        w-2
        rounded-full
        bg-white/80
        blur-[1px]
      "
    />
  </>
)}

                {/* アイコン */}
                <Icon
                  size={21}
                  strokeWidth={
                    active ? 2.5 : 2
                  }
                  className="relative z-10"
                />

                {/* 文字 */}
                <span
                  className={`
                    relative
                    z-10
                    mt-1.5
                    text-[10px]
                    tracking-[0.02em]

                    ${
                      active
                        ? "font-bold"
                        : "font-medium"
                    }
                  `}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}