"use client";

import { useSyncExternalStore } from "react";

const LG_MEDIA_QUERY = "(min-width: 1024px)";

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(LG_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(LG_MEDIA_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useLgViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
