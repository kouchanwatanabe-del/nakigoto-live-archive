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
                : pathname.startsWith(tab.href);

          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-[58px] flex-col items-center justify-center rounded-xl py-1.5 transition ${
                active
                  ? "bg-[#14526B] text-white"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {/* アイコン */}
              <Icon
                size={20}
                strokeWidth={2}
              />

              {/* ラベル */}
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