"use client";

import { useSyncExternalStore } from "react";

/**
 * 미디어 쿼리를 감지하는 훅
 * SSR 시 hydration mismatch를 방지하기 위해 초기값은 false
 * useSyncExternalStore를 사용하여 React 18 동시성 모드와 호환
 *
 * @param query - CSS 미디어 쿼리 문자열 (예: '(max-width: 767px)')
 * @returns 매치 여부
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    // subscribe
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    // getSnapshot (client)
    () => window.matchMedia(query).matches,
    // getServerSnapshot (server) - always return false on server
    () => false
  );
}
