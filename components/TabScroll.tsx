"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TabScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const isTabTransition =
      sessionStorage.getItem(
        "bottomNavTabTransition"
      );

    if (isTabTransition !== "true") {
      return;
    }

    sessionStorage.removeItem(
      "bottomNavTabTransition"
    );

    // 現在のスクロール位置
    const savedScroll =
  sessionStorage.getItem(
    "bottomNavScrollPosition"
  );

const currentScroll =
  savedScroll
    ? Number(savedScroll)
    : window.scrollY;

sessionStorage.removeItem(
  "bottomNavScrollPosition"
);

    // 移動先ページが短くても
    // 現在位置を維持できるだけの高さを一時的に確保
    const spacer = document.createElement("div");

    spacer.style.height = `${currentScroll + window.innerHeight}px`;
    spacer.style.width = "1px";
    spacer.style.pointerEvents = "none";

    document.body.appendChild(spacer);

    // ページ描画が落ち着いてから上へ移動
    const timer = window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      // スクロール終了後に仮の高さを削除
      const cleanupTimer =
        window.setTimeout(() => {
          spacer.remove();
        }, 800);

      return () => {
        window.clearTimeout(cleanupTimer);
      };
    }, 80);

    return () => {
      window.clearTimeout(timer);

      if (spacer.isConnected) {
        spacer.remove();
      }
    };
  }, [pathname]);

  return null;
}