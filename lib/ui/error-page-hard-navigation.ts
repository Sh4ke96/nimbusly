"use client";

import { useEffect } from "react";

/** global-error replaces the app shell — force full reloads instead of soft navigations. */
export function useErrorPageHardNavigation() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;

      const anchor = (event.target as Element).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      try {
        const target = new URL(href, window.location.href);
        if (target.origin !== window.location.origin) return;
      } catch {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.location.assign(href);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
}
