"use client";

import dynamic from "next/dynamic";

export const PwaRegisterLazy = dynamic(
  () => import("@/components/pwa/pwa-register").then((m) => m.PwaRegister),
  { ssr: false }
);
