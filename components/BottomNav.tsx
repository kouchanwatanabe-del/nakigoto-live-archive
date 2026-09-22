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

  const handleTabClick = (
  active: boolean
) => {
  if (active) return;

  // 移動元のスクロール位置を保存
  sessionStorage.setItem(
    "bottomNavScrollPosition",
    String(window.scrollY)
  );

  // 別タブへ移動したことを記録
  sessionStorage.setItem(
    "bottomNavTabTransition",
    "true"
  );

  // 詳細から戻るための復元フラグを解除
  sessionStorage.removeItem(
    "liveShouldRestoreScroll"
  );

  sessionStorage.removeItem(
    "songShouldRestoreScroll"
  );
};

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-lg">
      <div className="grid grid-cols-4 gap-1">
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
                    pathname.startsWith(
                      "/stats"
                    )
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
              className={`flex min-h-[58px] flex-col items-center justify-center rounded-xl py-1.5 transition ${
                active
                  ? "bg-[#14526B] text-white"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={2}
              />

              <span className="mt-1.5 text-[11px]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}