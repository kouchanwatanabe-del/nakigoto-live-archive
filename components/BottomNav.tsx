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
      label: "MY ARCHIVE",
      icon: Heart,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/lives") {
      return (
        pathname === "/lives" ||
        pathname.startsWith("/live/")
      );
    }

    if (href === "/collection") {
      return (
        pathname.startsWith("/collection") ||
        pathname.startsWith("/stats")
      );
    }

    return pathname.startsWith(href);
  };

  const activeIndex = tabs.findIndex((tab) =>
    isActive(tab.href)
  );

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
      <div
        className="
          relative
          rounded-[26px]
          border
          border-zinc-200/80
          bg-white/90
          p-1.5
          shadow-[0_8px_30px_rgba(0,0,0,0.10)]
          backdrop-blur-xl
        "
      >
        <div className="relative h-[54px]">

          {/* 移動する青いカプセル */}
          <div
            className="
              pointer-events-none
              absolute
              top-0
              h-[54px]
              rounded-[20px]
              bg-[#14526B]
              shadow-[0_4px_14px_rgba(20,82,107,0.25)]
              transition-all
              duration-500
              ease-[cubic-bezier(0.22,1,0.36,1)]
            "
            style={{
  width: activeIndex === 3 ? "39%" : "31%",
  left: `${
    activeIndex === 0
      ? 0
      : activeIndex === 1
        ? 23
        : activeIndex === 2
          ? 46
          : 61
  }%`,
}}
          />

          {/* タブ */}
          <div className="absolute inset-0 flex items-center justify-between">
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  scroll={false}
                  onClick={() =>
                    handleTabClick(active)
                  }
                  aria-label={tab.label}
                  className={`
                    relative
                    z-10
                    flex
                    h-[54px]
                    items-center
                    justify-center
                    rounded-[20px]
                    transition-all
                    duration-500
                    ease-[cubic-bezier(0.22,1,0.36,1)]

                    ${
                      active
  ? tab.href === "/collection"
    ? "w-[39%] gap-2 px-3 text-white"
    : "w-[31%] gap-2 px-3 text-white"
  : "w-[23%] text-zinc-400 hover:text-[#14526B]"
                    }
                  `}
                >
                  <Icon
                    size={21}
                    strokeWidth={
                      active ? 2.4 : 2
                    }
                    className={`
                      shrink-0
                      transition-transform
                      duration-500
                      ${
                        active
                          ? "scale-105"
                          : "scale-100"
                      }
                    `}
                  />

                  {/* 選択中の文字 */}
                  <span
                    className={`
                      overflow-hidden
                      whitespace-nowrap
                      text-[11px]
                      font-bold
                      tracking-[0.04em]
                      transition-all
                      duration-500

                      ${
                        active
                          ? "max-w-[110px] translate-x-0 opacity-100"
                          : "max-w-0 -translate-x-1 opacity-0"
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
      </div>
    </nav>
  );
}