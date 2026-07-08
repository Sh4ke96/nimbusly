"use client";

import { useEffect } from "react";

/** Mirrors document visibility on `<html data-page-hidden>` for CSS power-saving rules. */
export function PageVisibilitySync() {
  useEffect(() => {
    const root = document.documentElement;

    function sync() {
      if (document.hidden) {
        root.setAttribute("data-page-hidden", "");
      } else {
        root.removeAttribute("data-page-hidden");
      }
    }

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return null;
}
