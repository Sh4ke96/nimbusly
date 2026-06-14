"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfileStore } from "@/lib/stores/profile-store";

export function ProfileBootstrap({ children }: { children: React.ReactNode }) {
  const fetchSession = useProfileStore((s) => s.fetchSession);

  useEffect(() => {
    void fetchSession();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void fetchSession();
    });

    return () => subscription.unsubscribe();
  }, [fetchSession]);

  return children;
}
