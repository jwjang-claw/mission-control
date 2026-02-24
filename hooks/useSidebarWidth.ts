"use client";

import { useState, useCallback } from "react";
import { SIDEBAR } from "@/lib/constants";

type SidebarWidthHook = {
  width: number;
  setWidth: (width: number) => void;
};

function getStoredWidth(): number {
  if (typeof window === "undefined") return SIDEBAR.DEFAULT_WIDTH;

  const stored = localStorage.getItem(SIDEBAR.STORAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) {
      return Math.max(SIDEBAR.MIN_WIDTH, Math.min(SIDEBAR.MAX_WIDTH, parsed));
    }
  }
  return SIDEBAR.DEFAULT_WIDTH;
}

export function useSidebarWidth(): SidebarWidthHook {
  const [width, setWidthState] = useState<number>(getStoredWidth);

  const setWidth = useCallback((newWidth: number) => {
    const clamped = Math.max(
      SIDEBAR.MIN_WIDTH,
      Math.min(SIDEBAR.MAX_WIDTH, newWidth)
    );
    setWidthState(clamped);
    localStorage.setItem(SIDEBAR.STORAGE_KEY, clamped.toString());
  }, []);

  return { width, setWidth };
}
