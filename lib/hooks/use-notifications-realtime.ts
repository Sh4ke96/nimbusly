"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/lib/notifications/types";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useNotificationsRealtime(userId: string | undefined) {
  const applyNotificationChange = useNotificationsStore((s) => s.applyNotificationChange);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          applyNotificationChange(payload as RealtimePostgresChangesPayload<AppNotification>);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, applyNotificationChange]);
}
