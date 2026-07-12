"use client";

import { useSyncExternalStore } from "react";

function subscribePageVisible(onStoreChange: () => void) {
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
}

function getPageVisibleSnapshot(): boolean {
  return !document.hidden;
}

function getPageVisibleServerSnapshot(): boolean {
  return true;
}

/** False when the tab/PWA is backgrounded - pause timers, realtime, and animations. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribePageVisible,
    getPageVisibleSnapshot,
    getPageVisibleServerSnapshot
  );
}
