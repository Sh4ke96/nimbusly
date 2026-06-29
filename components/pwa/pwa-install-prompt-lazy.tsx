"use client";

import dynamic from "next/dynamic";

export const PwaInstallPromptLazy = dynamic(
  () => import("@/components/pwa/pwa-install-prompt").then((m) => m.PwaInstallPrompt),
  { ssr: false }
);
