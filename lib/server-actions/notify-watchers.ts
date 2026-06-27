"use server";

import { createClient } from "@/lib/supabase/server";
import { type WatchTable, watchEntityKindFromTable } from "@/lib/constants/watches";
import { loadWatcherRecipientIds } from "@/lib/notifications/load-watcher-recipient-ids";
import { excludeActorFromWatcherIds } from "@/lib/notifications/watches";
import { pushNotificationsToRecipients } from "@/lib/notifications/push-recipients";
import type { NotificationType } from "@/lib/constants/notifications";
import type { Json } from "@/lib/supabase/database.types";

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
  const watcherUserIds = await loadWatcherRecipientIds(params.watchTable, params.entityId);

  const recipientIds = excludeActorFromWatcherIds(watcherUserIds, params.actorId);

  if (recipientIds.length === 0) return;

  const { error } = await supabase.rpc("create_watcher_notifications", {
    p_watch_kind: watchEntityKindFromTable(params.watchTable),
    p_entity_id: params.entityId,
    p_recipient_ids: recipientIds,
    p_type: params.type,
    p_title: params.title,
    p_body: params.body,
    p_payload: params.payload as Json,
  });

  if (error) {
    console.error("[notifications] watcher notify failed", error.message);
    return;
  }

  await pushNotificationsToRecipients({
    recipientIds,
    title: params.title,
    body: params.body,
  });
}
