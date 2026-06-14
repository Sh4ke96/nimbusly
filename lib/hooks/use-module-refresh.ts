import { useCallback } from "react";
import { useNotificationsStore } from "@/lib/stores/notifications-store";

/** Refetches module data and the notifications feed after a mutation. */
export function useModuleRefresh(refetch: (force?: boolean) => Promise<void>) {
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  return useCallback(() => {
    void refetch(true);
    void fetchNotifications(true);
  }, [refetch, fetchNotifications]);
}
