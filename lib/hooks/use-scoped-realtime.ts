"use client";

import { useEffect } from "react";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useScopedRealtime<T extends Record<string, unknown>>(params: {
  userId: string | undefined;
  familyId: string | null;
  channelKey: string;
  table: string;
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void;
}) {
  const { userId, familyId, channelKey, table, onChange } = params;

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const filter = familyId
      ? `family_id=eq.${familyId}`
      : `created_by=eq.${userId}`;

    const channel = supabase
      .channel(`${channelKey}:${userId}:${familyId ?? ACCOUNT_MODE.SOLO}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        (payload) => onChange(payload as RealtimePostgresChangesPayload<T>)
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, familyId, channelKey, table, onChange]);
}
