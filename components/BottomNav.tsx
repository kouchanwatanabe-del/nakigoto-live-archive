"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  House,
  CalendarDays,
  Music2,
  Users,
  MapPin,
  Heart,
  Menu,
  X,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

 const menuTabs = [
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
    href: "/artists",
    label: "ARTISTS",
    icon: Users,
  },
  {
    href: "/venues",
    label: "VENUES",
    icon: MapPin,
  },
  {
    href: "/collection",
    label: "MY PAGE",
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

  if (href === "/artists") {
    return pathname.startsWith("/artists");
  }

  if (href === "/venues") {
    return pathname.startsWith("/venues");
  }

  if (href === "/collection") {
    return (
      pathname.startsWith("/collection") ||
      pathname.startsWith("/stats")
    );
  }

  return pathname.startsWith(href);
};

  const handleTabClick = (active: boolean) => {
    if (!active) {
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
    }

    setOpen(false);
  };

  // ページが変わったらメニューを閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const homeActive = isActive("/");

  return (
    <>
      {/* ================================= */}
      {/* MENU展開時の背景 */}
      {/* ================================= */}

      <button
        type="button"
        aria-label="メニューを閉じる"
        onClick={() => setOpen(false)}
        className={`
          fixed
          inset-0
          z-40
          bg-black/5
          backdrop-blur-[1px]
          transition-all
          duration-300

          ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* ================================= */}
      {/* 左下 HOME */}
      {/* ================================= */}

      <div
        className="
          fixed
          bottom-5
          left-4
          z-50
          sm:bottom-6
          sm:left-6
        "
      >
        <Link
          href="/"
          scroll={false}
          onClick={() => handleTabClick(homeActive)}
          aria-label="HOME"
          className={`
            flex
            h-[56px]
            w-[56px]
            items-center
            justify-center
            rounded-full
            border

            shadow-[0_7px_24px_rgba(0,0,0,0.12)]

            transition-all
            duration-300
            ease-[cubic-bezier(0.22,1,0.36,1)]

            active:scale-95

            ${
              homeActive
                ? "border-zinc-200/80 bg-white/95 text-[#14526B] backdrop-blur-xl"
                : "border-[#14526B] bg-[#14526B] text-white"
}
            }
          `}
        >
          <House
            size={21}
            strokeWidth={homeActive ? 2.4 : 2}
          />
        </Link>
      </div>

      {/* ================================= */}
      {/* 右下 MENU */}
      {/* ================================= */}

      <nav
        className="
          fixed
          bottom-5
          right-4
          z-50
          flex
          flex-col
          items-end
          sm:bottom-6
          sm:right-6
        "
      >
        {/* ================================= */}
        {/* 縦メニュー */}
        {/* 上から LIVE → SONGS → MY ARCHIVE */}
        {/* ================================= */}

        <div className="mb-3 flex flex-col items-end gap-2">
          {menuTabs.map((tab, index) => {
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
                  flex
                  h-[46px]
                  items-center
                  gap-2.5
                  rounded-full
                  border
                  px-4

                  shadow-[0_5px_18px_rgba(0,0,0,0.10)]
                  backdrop-blur-xl

                  transition-all
                  duration-300
                  ease-[cubic-bezier(0.22,1,0.36,1)]

                  ${
                    open
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-3 scale-95 opacity-0"
                  }

                  ${
                    active
                      ? "border-[#14526B] bg-[#14526B] text-white"
                      : "border-zinc-200/80 bg-white/95 text-[#14526B] hover:border-[#14526B]/40"
                  }
                `}
                style={{
                  transitionDelay: open
                    ? `${index * 45}ms`
                    : `${
                        (menuTabs.length - index - 1) *
                        25
                      }ms`,
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 2}
                  className="shrink-0"
                />

                <span className="whitespace-nowrap text-[11px] font-bold tracking-[0.05em]">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ================================= */}
        {/* MENUボタン */}
        {/* ================================= */}

        <button
          type="button"
          onClick={() =>
            setOpen((prev) => !prev)
          }
          aria-label={
            open
              ? "メニューを閉じる"
              : "メニューを開く"
          }
          aria-expanded={open}
          className={`
            flex
            h-[56px]
            items-center
            justify-center
            overflow-hidden
            rounded-full
            bg-[#14526B]
            text-white

            shadow-[0_7px_24px_rgba(20,82,107,0.30)]

            transition-all
            duration-300
            ease-[cubic-bezier(0.22,1,0.36,1)]

            active:scale-95

            ${
              open
                ? "w-[56px]"
                : "w-[92px] gap-2"
            }
          `}
        >
          {/* MENU / × アイコン */}

          <div className="relative h-[20px] w-[20px] shrink-0">
            <Menu
              size={20}
              strokeWidth={2.2}
              className={`
                absolute
                inset-0

                transition-all
                duration-300

                ${
                  open
                    ? "rotate-90 scale-50 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }
              `}
            />

            <X
              size={20}
              strokeWidth={2.2}
              className={`
                absolute
                inset-0

                transition-all
                duration-300

                ${
                  open
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-50 opacity-0"
                }
              `}
            />
          </div>

          {/* MENU文字 */}

          <span
            className={`
              overflow-hidden
              whitespace-nowrap

              text-[11px]
              font-bold
              tracking-[0.08em]

              transition-all
              duration-300

              ${
                open
                  ? "max-w-0 -translate-x-2 opacity-0"
                  : "max-w-[50px] translate-x-0 opacity-100"
              }
            `}
          >
            MENU
          </span>
        </button>
      </nav>
    </>
  );
}