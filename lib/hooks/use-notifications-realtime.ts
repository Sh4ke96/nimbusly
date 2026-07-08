"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/lib/notifications/types";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useNotificationsRealtime(userId: string | undefined) {
  const pageVisible = usePageVisible();
  const wasBackgroundedRef = useRef(false);
  const applyNotificationChange = useNotificationsStore((s) => s.applyNotificationChange);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  useEffect(() => {
    if (!userId) return;

    if (!pageVisible) {
      wasBackgroundedRef.current = true;
      return;
    }

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

    if (wasBackgroundedRef.current) {
      wasBackgroundedRef.current = false;
      void fetchNotifications(true);
    }

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, pageVisible, applyNotificationChange, fetchNotifications]);
}
