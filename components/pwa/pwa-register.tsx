"use client";

import { useEffect } from "react";
import { PWA_SW_PATH } from "@/lib/constants/pwa";
import { isStandaloneDisplay } from "@/lib/pwa/is-standalone-display";

const PWA_STANDALONE_CLASS = "pwa-standalone";

export function PwaRegister() {
  useEffect(() => {
    const root = document.documentElement;
    if (isStandaloneDisplay()) {
      root.classList.add(PWA_STANDALONE_CLASS);
    } else {
      root.classList.remove(PWA_STANDALONE_CLASS);
    }

    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register(PWA_SW_PATH, { scope: "/" }).then(() => {
      void navigator.serviceWorker.ready;
    }).catch(() => {
      // SW registration is best-effort; app works without it.
    });
  }, []);

  return null;
}
