"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

  // ========================================
  // ADMIN MODE
  // ========================================

  const [adminMode, setAdminMode] = useState(false);
  const [adminLoaded, setAdminLoaded] = useState(false);
  const [adminMessage, setAdminMessage] = useState<
    "ON" | "OFF" | null
  >(null);

  const homeTapCount = useRef(0);
  const homeTapTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  // ========================================
  // ADMIN状態を読み込み
  // ========================================

  useEffect(() => {
    const savedAdminMode =
      localStorage.getItem("adminMode");

    setAdminMode(savedAdminMode === "true");
    setAdminLoaded(true);
  }, []);

  // ========================================
  // メニュー
  // ========================================

  const normalTabs = [
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
  ];

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

  const myPageTab = {
    href: "/collection",
    label: "MY PAGE",
    icon: Heart,
  };

  const menuTabs = [
    ...normalTabs,

    ...(adminMode
      ? adminTabs
      : []),

    myPageTab,
  ];

  // ========================================
  // 現在ページ判定
  // ========================================

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

  // ========================================
  // タブ移動
  // ========================================

  const handleTabClick = (
    active: boolean
  ) => {
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

  // ========================================
  // HOME 5回タップ
  // ========================================

  const handleHomeClick = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    /*
      HOME以外のページでは、
      普通にHOMEへ移動させる。

      隠しコマンドはHOME画面にいる時だけ有効。
    */

    if (!homeActive) {
      handleTabClick(false);
      return;
    }

    /*
      HOMEにいる場合はページ移動を止めて
      タップ数をカウント
    */

    event.preventDefault();

    homeTapCount.current += 1;

    // 前のタイマーをリセット
    if (homeTapTimer.current) {
      clearTimeout(
        homeTapTimer.current
      );
    }

    /*
      1.5秒以内に次を押さなかったら
      カウントをリセット
    */

    homeTapTimer.current =
      setTimeout(() => {
        homeTapCount.current = 0;
      }, 1500);

    // ======================================
    // 5回タップ
    // ======================================

    if (homeTapCount.current >= 5) {
      homeTapCount.current = 0;

      if (homeTapTimer.current) {
        clearTimeout(
          homeTapTimer.current
        );

        homeTapTimer.current = null;
      }

      const nextAdminMode =
        !adminMode;

      setAdminMode(nextAdminMode);

      localStorage.setItem(
        "adminMode",
        String(nextAdminMode)
      );

      // MENUは一旦閉じる
      setOpen(false);

      // メッセージ表示
      setAdminMessage(
        nextAdminMode
          ? "ON"
          : "OFF"
      );

      // 1.2秒後に消す
      setTimeout(() => {
        setAdminMessage(null);
      }, 1200);
    }
  };

  // ========================================
  // ページ変更時
  // ========================================

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ========================================
  // タイマー掃除
  // ========================================

  useEffect(() => {
    return () => {
      if (homeTapTimer.current) {
        clearTimeout(
          homeTapTimer.current
        );
      }
    };
  }, []);

  const homeActive = isActive("/");

  // localStorage読み込み前の
  // メニュー内容変化を防止
  if (!adminLoaded) {
    return null;
  }

  return (
    <>
      {/* ================================= */}
      {/* ADMIN MODE 表示 */}
      {/* ================================= */}

      <div
        className={`
          pointer-events-none
          fixed
          left-1/2
          top-1/2
          z-[9999]
          -translate-x-1/2
          -translate-y-1/2

          rounded-full
          bg-[#14526B]
          px-5
          py-2.5

          text-[11px]
          font-bold
          tracking-[0.15em]
          text-white

          shadow-[0_8px_30px_rgba(20,82,107,0.30)]

          transition-all
          duration-300

          ${
            adminMessage
              ? "scale-100 opacity-100"
              : "scale-90 opacity-0"
          }
        `}
      >
        ADMIN MODE {adminMessage}
      </div>

      {/* ================================= */}
      {/* MENU展開時の背景 */}
      {/* ================================= */}

      <button
        type="button"
        aria-label="メニューを閉じる"
        onClick={() =>
          setOpen(false)
        }
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
          onClick={handleHomeClick}
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
          `}
        >
          <House
            size={21}
            strokeWidth={
              homeActive
                ? 2.4
                : 2
            }
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
        {/* ================================= */}

        <div className="mb-3 flex flex-col items-end gap-2">
          {menuTabs.map(
            (tab, index) => {
              const active =
                isActive(tab.href);

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
                    transitionDelay:
                      open
                        ? `${index * 45}ms`
                        : `${
                            (
                              menuTabs.length -
                              index -
                              1
                            ) * 25
                          }ms`,
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={
                      active
                        ? 2.4
                        : 2
                    }
                    className="shrink-0"
                  />

                  <span
                    className="
                      whitespace-nowrap
                      text-[11px]
                      font-bold
                      tracking-[0.05em]
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
        {/* MENUボタン */}
        {/* ================================= */}

        <button
          type="button"
          onClick={() =>
            setOpen(
              (prev) => !prev
            )
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
          {/* MENU / X */}

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