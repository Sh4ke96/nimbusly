"use client";

import { useNotificationsRealtime } from "@/lib/hooks/use-notifications-realtime";
import { useProfileStore } from "@/lib/stores/profile-store";

export function NotificationsRealtimeBridge() {
  const userId = useProfileStore((s) => s.user?.id);
  useNotificationsRealtime(userId);
  return null;
}
