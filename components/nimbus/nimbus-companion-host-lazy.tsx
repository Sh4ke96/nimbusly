"use client";

import dynamic from "next/dynamic";

export const NimbusCompanionHostLazy = dynamic(
  () =>
    import("@/components/nimbus/nimbus-companion-host").then((m) => m.NimbusCompanionHost),
  { ssr: false }
);
