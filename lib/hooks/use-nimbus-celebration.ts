"use client";

import { tryTriggerCelebration, type NimbusCelebrationId } from "@/lib/nimbus/celebrations";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useT } from "@/lib/lang-context";

export function useNimbusCelebration() {
  const t = useT();
  const announceCustomHint = useNimbusStore((s) => s.announceCustomHint);

  return function celebrate(id: NimbusCelebrationId) {
    if (!tryTriggerCelebration(id)) return;
    const message = t.companion.celebrations[id];
    if (!message) return;
    announceCustomHint(message, "celebration");
  };
}
