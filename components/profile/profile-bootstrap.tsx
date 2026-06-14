"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";

export function ProfileBootstrap({ children }: { children: React.ReactNode }) {
  const fetchSession = useProfileStore((s) => s.fetchSession);
  const resetProfile = useProfileStore((s) => s.reset);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const resetNotifications = useNotificationsStore((s) => s.reset);

  useEffect(() => {
    void fetchSession().then(() => fetchNotifications());

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") return;

      if (event === "SIGNED_OUT") {
        resetProfile();
        resetNotifications();
        return;
      }

      void fetchSession(true).then(() => fetchNotifications(true));
    });

    return () => subscription.unsubscribe();
  }, [fetchSession, fetchNotifications, resetProfile, resetNotifications]);

  return children;
}
