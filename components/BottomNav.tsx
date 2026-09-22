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

                  ${
                    active
                      ? "text-[#14526B]"
                      : "text-zinc-500 hover:text-[#14526B]"
                  }
                `}
              >
                {/* 選択中の水滴 */}
                {active && (
                  <>
                    <div
                      className="
                        absolute
                        inset-0
                        rounded-[22px]
                        border
                        border-white/80
                        bg-gradient-to-br
                        from-sky-200/55
                        via-cyan-100/35
                        to-white/30
                        shadow-[inset_0_1px_5px_rgba(255,255,255,0.95),0_4px_14px_rgba(14,165,233,0.15)]
                        backdrop-blur-xl
                      "
                    />

                    {/* 水の光 */}
                    <div
                      className="
                        absolute
                        left-[18%]
                        top-[5px]
                        h-[7px]
                        w-[45%]
                        rounded-full
                        bg-white/70
                        blur-[2px]
                      "
                    />

                    {/* 水色の影 */}
                    <div
                      className="
                        absolute
                        -bottom-3
                        right-0
                        h-8
                        w-12
                        rounded-full
                        bg-sky-300/30
                        blur-xl
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