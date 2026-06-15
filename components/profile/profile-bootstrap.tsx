"use client";

import { useEffect } from "react";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";

export function ProfileBootstrap({ children }: { children: React.ReactNode }) {
  const error = useProfileStore((s) => s.error);
  const fetchSession = useProfileStore((s) => s.fetchSession);

  useEffect(() => {
    const fetchNotifications = useNotificationsStore.getState().fetchNotifications;
    void fetchSession().then(() => fetchNotifications());
  }, [fetchSession]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <ModuleFetchError onRetry={() => void fetchSession(true)} />
      </div>
    );
  }

  return children;
}
