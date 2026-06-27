"use server";

import { createClient } from "@/lib/supabase/server";
import { excludeActorFromWatcherIds } from "@/lib/notifications/watches";
import { pushNotificationsToRecipients } from "@/lib/notifications/push-recipients";
import type { NotificationType } from "@/lib/constants/notifications";
import type { Json } from "@/lib/supabase/database.types";

type WatchTable = "budget_watches" | "shopping_list_watches";

export async function notifyEntityWatchers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    watchTable: WatchTable;
    entityColumn: "budget_id" | "list_id";
    entityId: string;
    actorId: string;
    type: NotificationType;
    title: string;
    body: string;
    payload: Record<string, unknown>;
  }
): Promise<void> {
  const watchesQuery =
    params.watchTable === "budget_watches"
      ? supabase
          .from("budget_watches")
          .select("user_id")
          .eq("budget_id", params.entityId)
      : supabase
          .from("shopping_list_watches")
          .select("user_id")
          .eq("list_id", params.entityId);

  const { data: watches } = await watchesQuery;

  const recipientIds = excludeActorFromWatcherIds(
    (watches ?? []).map((watch) => watch.user_id),
    params.actorId
  );

  if (recipientIds.length === 0) return;

  await supabase.rpc("create_family_notifications", {
    p_recipient_ids: recipientIds,
    p_type: params.type,
    p_title: params.title,
    p_body: params.body,
    p_payload: params.payload as Json,
  });

  pushNotificationsToRecipients({
    recipientIds,
    title: params.title,
    body: params.body,
  });
}
