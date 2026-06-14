"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";

export function ProfileBootstrap({ children }: { children: React.ReactNode }) {
  const fetchSession = useProfileStore((s) => s.fetchSession);
  const resetNotifications = useNotificationsStore((s) => s.reset);

  useEffect(() => {
    void fetchSession();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void fetchSession();
      resetNotifications();
    });

    return () => subscription.unsubscribe();
  }, [fetchSession, resetNotifications]);

  return children;
}
