"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getIsMac() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /Mac/.test(navigator.userAgent);
}

export function useIsMac() {
  return useSyncExternalStore(subscribe, getIsMac, () => false);
}
