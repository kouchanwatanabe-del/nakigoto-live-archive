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

    const timer = window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, 80);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}