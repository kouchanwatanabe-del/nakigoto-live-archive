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
      label: "MUSIC",
      icon: Music2,
    },
    {
      href: "/collection",
      label: "COLLECTION",
      icon: Heart,
    },
  ];

  // 現在選択されているタブ
  const activeIndex = tabs.findIndex((tab) => {
    if (tab.href === "/") {
      return pathname === "/";
    }

    if (tab.href === "/lives") {
      return (
        pathname === "/lives" ||
        pathname.startsWith("/live/")
      );
    }

    return pathname.startsWith(tab.href);
  });

  const safeActiveIndex =
    activeIndex === -1 ? 0 : activeIndex;

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-lg">

      <div className="relative">

        {/* スライドする青い背景 */}
        <div
          className="absolute bottom-0 left-0 top-0 w-1/4 p-0.5 transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${safeActiveIndex * 100}%)`,
          }}
        >
          <div className="h-full w-full rounded-xl bg-[#14526B]" />
        </div>

        {/* タブ */}
        <div className="relative z-10 grid grid-cols-4">
          {tabs.map((tab, index) => {
            const active =
              index === safeActiveIndex;

            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex min-h-[58px] flex-col items-center justify-center rounded-xl py-1.5 transition-colors duration-300 ${
                  active
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-900"
                }`}
              >
                {/* アイコン */}
                <Icon
                  size={20}
                  strokeWidth={active ? 2.4 : 2}
                  className="transition-all duration-300"
                />

                {/* ラベル */}
                <span
                  className={`mt-1.5 text-[11px] transition-all duration-300 ${
                    active
                      ? "font-semibold"
                      : "font-normal"
                  }`}
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