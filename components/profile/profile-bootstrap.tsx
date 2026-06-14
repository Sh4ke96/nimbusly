"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { resetAllClientStores } from "@/lib/stores/reset-all-client-stores";

function deferAuthSideEffect(fn: () => void) {
  window.setTimeout(fn, 0);
}

export function ProfileBootstrap({ children }: { children: React.ReactNode }) {
  const error = useProfileStore((s) => s.error);
  const fetchSession = useProfileStore((s) => s.fetchSession);

  useEffect(() => {
    const fetchNotifications = useNotificationsStore.getState().fetchNotifications;

    void fetchSession().then(() => fetchNotifications());

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;

      if (event === "SIGNED_OUT") {
        resetAllClientStores();
        return;
      }

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        deferAuthSideEffect(() => {
          void useProfileStore
            .getState()
            .fetchSession(true)
            .then(() => useNotificationsStore.getState().fetchNotifications(true));
        });
      }
    });

    return () => subscription.unsubscribe();
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
