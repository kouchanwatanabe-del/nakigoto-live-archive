"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/",
      label: "HOME",
      icon: "⌂",
    },
    {
      href: "/lives",
      label: "LIVE",
      icon: "◫",
    },
    {
      href: "/songs",
      label: "MUSIC",
      icon: "♫",
    },
    {
      href: "/collection",
      label: "COLLECTION",
      icon: "★",
    },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-md -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : tab.href === "/lives"
                ? pathname === "/lives" || pathname.startsWith("/live/")
                : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-[68px] flex-col items-center justify-center rounded-xl py-2 transition ${
                active
                  ? "bg-[#14526B] text-white"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {/* アイコン */}
              <span className="text-2xl leading-none">
                {tab.icon}
              </span>

              {/* ラベル */}
              <span className="mt-2 text-xs">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}