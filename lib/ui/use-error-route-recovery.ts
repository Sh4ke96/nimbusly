"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** When global-error is active, soft navigations change the URL but keep the error UI. */
export function useErrorRouteRecovery() {
  const pathname = usePathname();
  const routeRef = useRef<string | null>(null);

  useEffect(() => {
    const href = `${pathname}${window.location.search}`;

    if (routeRef.current === null) {
      routeRef.current = href;
      return;
    }

    if (routeRef.current !== href) {
      window.location.assign(href);
    }
  }, [pathname]);
}
