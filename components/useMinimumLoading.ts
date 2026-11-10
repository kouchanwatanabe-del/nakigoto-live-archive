"use client";

import { useEffect, useState } from "react";

// 初回表示から最低350ms、データ取得完了までローディングを表示
export function useMinimumLoading(loading: boolean, minimumDuration = 350): boolean {
  const [minimumElapsed, setMinimumElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumElapsed(true), minimumDuration);
    return () => window.clearTimeout(timer);
  }, [minimumDuration]);

  return loading || !minimumElapsed;
}
