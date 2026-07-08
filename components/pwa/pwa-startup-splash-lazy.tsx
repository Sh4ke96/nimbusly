"use client";

import dynamic from "next/dynamic";

export const PwaStartupSplashLazy = dynamic(
  () =>
    import("@/components/pwa/pwa-startup-splash").then((m) => m.PwaStartupSplash),
  { ssr: false }
);
