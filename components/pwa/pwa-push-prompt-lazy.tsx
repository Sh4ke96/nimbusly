"use client";

import dynamic from "next/dynamic";

export const PwaPushPromptLazy = dynamic(
  () => import("@/components/pwa/pwa-push-prompt").then((m) => m.PwaPushPrompt),
  { ssr: false }
);
