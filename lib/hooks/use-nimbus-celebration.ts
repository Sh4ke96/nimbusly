"use client";

import { tryTriggerCelebration, type NimbusCelebrationId } from "@/lib/nimbus/celebrations";
import {
  enqueueNimbusMessage,
  NIMBUS_MESSAGE_PRIORITY,
} from "@/lib/nimbus/message-dispatcher";
import { useT } from "@/lib/lang-context";

export function useNimbusCelebration() {
  const t = useT();

  return function celebrate(id: NimbusCelebrationId) {
    if (!tryTriggerCelebration(id)) return;
    const message = t.companion.celebrations[id];
    if (!message) return;
    enqueueNimbusMessage({
      priority: NIMBUS_MESSAGE_PRIORITY.celebration,
      kind: "celebration",
      message,
    });
  };
}
