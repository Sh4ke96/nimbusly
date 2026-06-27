"use client";

import { useEffect } from "react";
import { PWA_SW_PATH } from "@/lib/constants/pwa";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register(PWA_SW_PATH, { scope: "/" }).catch(() => {
      // SW registration is best-effort; app works without it.
    });
  }, []);

  return null;
}
