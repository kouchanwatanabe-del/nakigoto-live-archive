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
      {/* ナビ本体 */}
      <div
        className="
          flex
          items-center
          justify-between
          rounded-[26px]
          border
          border-zinc-200/80
          bg-white/90
          p-1.5
          shadow-[0_8px_30px_rgba(0,0,0,0.10)]
          backdrop-blur-xl
        "
      >
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
              aria-label={tab.label}
              className={`
                flex
                h-[54px]
                items-center
                justify-center
                rounded-[20px]
                transition-all
                duration-300
                ease-out

                ${
                  active
                    ? "min-w-[112px] gap-2 bg-[#14526B] px-4 text-white shadow-[0_4px_12px_rgba(20,82,107,0.22)]"
                    : "w-[54px] text-zinc-400 hover:bg-zinc-100 hover:text-[#14526B]"
                }
              `}
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.4 : 2}
                className="shrink-0"
              />

              {/* 選択中だけ文字を表示 */}
              {active && (
                <span
                  className="
                    whitespace-nowrap
                    text-[11px]
                    font-bold
                    tracking-[0.04em]
                  "
                >
                  {tab.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
