"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getServerSearchSnapshot(): string {
  return "";
}

export function useClientSearchString(): string {
  const pathname = usePathname();

  return useSyncExternalStore(
    subscribe,
    () => {
      void pathname;
      const raw = window.location.search;
      return raw.startsWith("?") ? raw.slice(1) : raw;
    },
    getServerSearchSnapshot
  );
}
