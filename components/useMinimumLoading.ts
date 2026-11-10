
"use client";

import { useEffect, useState } from "react";

export function useMinimumLoading(
  loading: boolean,
  minimumDuration = 800
): boolean {
  const [minimumElapsed, setMinimumElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMinimumElapsed(true);
    }, minimumDuration);

    return () => window.clearTimeout(timer);
  }, [minimumDuration]);

  return loading || !minimumElapsed;
}
