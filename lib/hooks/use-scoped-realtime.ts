"use client";

import { useEffect, useRef } from "react";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
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
  const pageVisible = usePageVisible();
  const onChangeRef = useRef(onChange);
  const wasBackgroundedRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!userId) return;

    if (!pageVisible) {
      wasBackgroundedRef.current = true;
      return;
    }

    const supabase = createClient();
    const filter = familyId
      ? `family_id=eq.${familyId}`
      : `created_by=eq.${userId}`;

    const channel = supabase
      .channel(`${channelKey}:${userId}:${familyId ?? ACCOUNT_MODE.SOLO}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        (payload) =>
          onChangeRef.current(payload as RealtimePostgresChangesPayload<T>)
      )
      .subscribe();

    if (wasBackgroundedRef.current) {
      wasBackgroundedRef.current = false;
      onChangeRef.current({ eventType: "UPDATE" } as unknown as RealtimePostgresChangesPayload<T>);
    }

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, familyId, channelKey, table, pageVisible]);
}
