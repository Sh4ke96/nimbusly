import { PUSH_BATCH_TAG_PREFIX, PUSH_BATCH_WINDOW_MS } from "@/lib/constants/push-batch";
import type { NotificationModuleId } from "@/lib/constants/notification-modules";
import { getNotificationTypesForModule } from "@/lib/notifications/module-route";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { formatMessage } from "@/lib/i18n/format";
import type { Dict } from "@/lib/i18n/types";

export type GroupedPushTitleLabel = Dict["notifications"]["groupedPushTitle"];

export async function countRecentModuleNotificationsFromActor(params: {
  recipientId: string;
  actorId: string;
  moduleId: NotificationModuleId;
  sinceIso: string;
}): Promise<number> {
  const types = getNotificationTypesForModule(params.moduleId);
  if (types.length === 0) return 0;

  const supabase = createServiceRoleClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", params.recipientId)
    .gte("created_at", params.sinceIso)
    .in("type", [...types])
    .filter("payload->>actor_id", "eq", params.actorId);

  if (error) {
    console.error("[push] batch count failed", error.message);
    return 1;
  }

  return Math.max(count ?? 1, 1);
}

export async function resolveGroupedPushForRecipient(params: {
  recipientId: string;
  actorId: string;
  actorName: string;
  moduleId: NotificationModuleId;
  moduleLabel: string;
  singleTitle: string;
  singleBody: string;
  labels: GroupedPushTitleLabel;
}): Promise<{ title: string; body: string; tag: string }> {
  const sinceIso = new Date(Date.now() - PUSH_BATCH_WINDOW_MS).toISOString();
  const count = await countRecentModuleNotificationsFromActor({
    recipientId: params.recipientId,
    actorId: params.actorId,
    moduleId: params.moduleId,
    sinceIso,
  });

  const tag = `${PUSH_BATCH_TAG_PREFIX}:${params.recipientId}:${params.actorId}:${params.moduleId}`;

  if (count <= 1) {
    return { title: params.singleTitle, body: params.singleBody, tag };
  }

  return {
    title: formatMessage(params.labels, {
      actor: params.actorName,
      count: String(count),
      module: params.moduleLabel,
    }),
    body: params.singleBody,
    tag,
  };
}
