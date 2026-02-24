"use client";

import { useState, useCallback, useEffect } from "react";
import { SIDEBAR } from "@/lib/constants";

type SidebarWidthHook = {
  width: number;
  setWidth: (width: number) => void;
};

export function useSidebarWidth(): SidebarWidthHook {
  // Always start with default width to match server render
  const [width, setWidthState] = useState<number>(SIDEBAR.DEFAULT_WIDTH);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read stored width after hydration to avoid mismatch
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR.STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) {
        const clamped = Math.max(SIDEBAR.MIN_WIDTH, Math.min(SIDEBAR.MAX_WIDTH, parsed));
        setWidthState(clamped);
      }
    }
    setIsHydrated(true);
  }, []);

  const setWidth = useCallback((newWidth: number) => {
    const clamped = Math.max(
      SIDEBAR.MIN_WIDTH,
      Math.min(SIDEBAR.MAX_WIDTH, newWidth)
    );
    setWidthState(clamped);
    if (typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR.STORAGE_KEY, clamped.toString());
    }
  }, []);

  return { width, setWidth };
}
