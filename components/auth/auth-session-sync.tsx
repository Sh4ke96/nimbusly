"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { resetAllClientStores } from "@/lib/stores/reset-all-client-stores";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useProfileStore } from "@/lib/stores/profile-store";

function deferAuthSideEffect(fn: () => void) {
  window.setTimeout(fn, 0);
}

export function AuthSessionSync() {
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;

      if (event === "SIGNED_OUT") {
        resetAllClientStores();
        return;
      }

      if (event === "SIGNED_IN") {
        resetAllClientStores();
        deferAuthSideEffect(() => {
          void useProfileStore
            .getState()
            .fetchSession(true)
            .then(() => useNotificationsStore.getState().fetchNotifications(true));
        });
        return;
      }

      if (event === "USER_UPDATED") {
        deferAuthSideEffect(() => {
          void useProfileStore
            .getState()
            .fetchSession(true)
            .then(() => useNotificationsStore.getState().fetchNotifications(true));
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
