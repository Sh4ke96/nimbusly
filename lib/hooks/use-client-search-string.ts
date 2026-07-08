"use client";

import { usePathname } from "next/navigation";

/**
 * Current query string (no leading `?`) without `useSearchParams`.
 * Use in persistent layout chrome so navigation does not suspend/unmount shell UI.
 */
export function useClientSearchString(): string {
  const pathname = usePathname();

  if (typeof window === "undefined") {
    return "";
  }

  // Re-read after soft navigations when pathname updates.
  void pathname;
  const raw = window.location.search;
  return raw.startsWith("?") ? raw.slice(1) : raw;
}
