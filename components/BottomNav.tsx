"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  House,
  CalendarDays,
  Music2,
  Heart,
  Users,
  MapPin,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // ========================================
  // 管理者モード
  // ========================================

  const [adminMode, setAdminMode] =
    useState(false);

  useEffect(() => {
    const loadAdminMode = () => {
      const saved =
        localStorage.getItem(
          "adminMode"
        );

      setAdminMode(
        saved === "true"
      );
    };

    loadAdminMode();

    // 別タブなどで変更された場合
    window.addEventListener(
      "storage",
      loadAdminMode
    );

    // 同じタブ内で変更した場合用
    window.addEventListener(
      "adminModeChanged",
      loadAdminMode
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadAdminMode
      );

      window.removeEventListener(
        "adminModeChanged",
        loadAdminMode
      );
    };
  }, []);

  // ========================================
  // メインTABS
  // ========================================

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
      label: "MY PAGE",
      icon: Heart,
    },
  ];

  // ========================================
  // 管理者用TABS
  // ========================================

  const adminTabs = [
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
  ];

  // ========================================
  // ACTIVE判定
  // ========================================

  const isActive = (
    href: string
  ) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/lives") {
      return (
        pathname === "/lives" ||
        pathname.startsWith(
          "/live/"
        )
      );
    }

    if (href === "/songs") {
      return pathname.startsWith(
        "/songs"
      );
    }

    if (
      href === "/collection"
    ) {
      return (
        pathname.startsWith(
          "/collection"
        ) ||
        pathname.startsWith(
          "/stats"
        )
      );
    }

    if (
      href === "/artists"
    ) {
      return pathname.startsWith(
        "/artists"
      );
    }

    if (
      href === "/venues"
    ) {
      return pathname.startsWith(
        "/venues"
      );
    }

    return pathname.startsWith(
      href
    );
  };

  // ========================================
  // 現在のメインタブ
  // ========================================

  const activeIndex =
    tabs.findIndex((tab) =>
      isActive(tab.href)
    );

  // ========================================
  // タブ移動
  // ========================================

  const handleTabClick = (
    active: boolean
  ) => {
    if (active) {
      return;
    }

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

  // ========================================
  // JSX
  // ========================================

  return (
    <nav
      className="
        fixed
        bottom-2
        left-1/2
        z-50

        w-[calc(100%-24px)]
        max-w-[390px]

        -translate-x-1/2
      "
    >
      {/* ================================= */}
      {/* 管理者モード専用 */}
      {/* ARTISTS / VENUES */}
      {/* ================================= */}

      <div
        className={`
          mb-2
          flex
          items-center
          justify-end
          gap-2
          pr-1

          transition-all
          duration-300

          ${
            adminMode
              ? `
                pointer-events-auto
                translate-y-0
                opacity-100
              `
              : `
                pointer-events-none
                translate-y-2
                opacity-0
              `
          }
        `}
      >
        {adminTabs.map(
          (tab) => {
            const active =
              isActive(
                tab.href
              );

            const Icon =
              tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                scroll={false}
                onClick={() =>
                  handleTabClick(
                    active
                  )
                }
                aria-label={
                  tab.label
                }
                className={`
                  flex
                  h-9
                  items-center
                  justify-center
                  gap-1

                  rounded-full
                  border
                  px-3

                  shadow-[0_3px_12px_rgba(0,0,0,0.08)]

                  backdrop-blur-xl

                  transition-all
                  duration-200

                  active:scale-95

                  ${
                    active
                      ? `
                        border-[#14526B]
                        bg-[#14526B]
                        text-white
                      `
                      : `
                        border-zinc-200/80
                        bg-white/95
                        text-[#14526B]

                        hover:border-[#14526B]/40
                      `
                  }
                `}
              >
                <Icon
                  size={15}
                  strokeWidth={
                    active
                      ? 2.4
                      : 2
                  }
                />

                <span
                  className="
                    text-[9px]
                    font-bold
                    tracking-[0.06em]
                  "
                >
                  {tab.label}
                </span>
              </Link>
            );
          }
        )}
      </div>

      {/* ================================= */}
      {/* メインナビ */}
      {/* ================================= */}

      <div
        className="
          relative

          rounded-[28px]

          border
          border-zinc-200/80

          bg-white/95

          p-1.5

          shadow-[0_8px_30px_rgba(0,0,0,0.12)]

          backdrop-blur-xl
        "
      >
        <div className="relative h-[46px]">

          {/* ================================= */}
          {/* 青い移動カプセル */}
          {/* ================================= */}

          {activeIndex !== -1 && (
            <div
              className="
                pointer-events-none

                absolute
                top-0

                h-[46px]
rounded-[19px]

                bg-[#14526B]

                shadow-[0_4px_14px_rgba(20,82,107,0.25)]

                transition-all
                duration-500

                ease-[cubic-bezier(0.22,1,0.36,1)]
              "
              style={{
                width: "31%",
                left:
                  activeIndex === 0
                    ? "0%"
                    : activeIndex === 1
                      ? "23%"
                      : activeIndex === 2
                        ? "46%"
                        : "69%",
              }}
            />
          )}

          {/* ================================= */}
          {/* メインタブ */}
          {/* ================================= */}

          <div
            className="
              absolute
              inset-0

              flex
              items-center
              justify-between
            "
          >
            {tabs.map(
              (tab) => {
                const active =
                  isActive(
                    tab.href
                  );

                const Icon =
                  tab.icon;

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    scroll={false}
                    onClick={() =>
                      handleTabClick(
                        active
                      )
                    }
                    aria-label={
                      tab.label
                    }
                    className={`
                      relative
                      z-10

                      flex
                     h-[46px]

                      items-center
                      justify-center

                      rounded-[19px]

                      transition-all
                      duration-500

                      ease-[cubic-bezier(0.22,1,0.36,1)]

                      ${
                        active
                          ? `
                            w-[31%]
                            gap-2
                            px-3
                            text-white
                          `
                          : `
                            w-[23%]
                            text-zinc-400

                            hover:text-[#14526B]
                          `
                      }
                    `}
                  >
                    {/* アイコン */}

                    <Icon
                      size={21}
                      strokeWidth={
                        active
                          ? 2.4
                          : 2
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

                    {/* ================================= */}
                    {/* 選択中だけ文字表示 */}
                    {/* ================================= */}

                    <span
                      className={`
                        overflow-hidden
                        whitespace-nowrap

                        text-[10px]
                        font-bold
                        tracking-[0.04em]

                        transition-all
                        duration-500

                        ${
                          active
                            ? `
                              max-w-[90px]
                              translate-x-0
                              opacity-100
                            `
                            : `
                              max-w-0
                              -translate-x-1
                              opacity-0
                            `
                        }
                      `}
                    >
                      {tab.label}
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}