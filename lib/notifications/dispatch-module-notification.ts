"use server";

import type { NotificationType } from "@/lib/constants/notifications";
import type { NotificationModuleId } from "@/lib/constants/notification-modules";
import { dispatchInAppAndPushNotifications } from "@/lib/notifications/dispatch-notifications";
import { loadRecipientModulePreferences } from "@/lib/notifications/module-preferences/load-module-preferences";
import { partitionRecipientsByChannel } from "@/lib/notifications/module-preferences/filter-recipients-by-channel";
import { getNotificationModuleId } from "@/lib/notifications/module-route";
import type { GroupedPushTitleLabel } from "@/lib/push/resolve-grouped-push";
import type { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

type NotifyModuleSubscribersParams = {
  moduleId?: NotificationModuleId;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  actorId: string;
  actorName: string;
  moduleLabel: string;
  groupedPushTitle: GroupedPushTitleLabel;
  recipientIds: string[];
};

export async function notifyModuleSubscribers(
  _supabase: Awaited<ReturnType<typeof createClient>>,
  params: NotifyModuleSubscribersParams
): Promise<void> {
  const moduleId = params.moduleId ?? getNotificationModuleId(params.type);
  if (!moduleId) {
    console.error("[notifications] unknown module for type", params.type);
    return;
  }

  const recipientIds = params.recipientIds.filter((id) => id !== params.actorId);
  if (recipientIds.length === 0) return;

  const preferences = await loadRecipientModulePreferences(recipientIds, moduleId);
  const { inAppIds, pushIds } = partitionRecipientsByChannel(recipientIds, preferences);

  if (inAppIds.length > 0) {
    const admin = createServiceRoleClient();
    const { error } = await admin.rpc("create_family_notifications", {
      p_recipient_ids: inAppIds,
      p_type: params.type,
      p_title: params.title,
      p_body: params.body,
      p_payload: params.payload as Json,
    });

    if (error) {
      console.error("[notifications] in-app notify failed", error.message);
    }
  }

  if (pushIds.length > 0) {
    await dispatchInAppAndPushNotifications({
      rpcError: null,
      logContext: "module push",
      recipientIds: pushIds,
      type: params.type,
      title: params.title,
      body: params.body,
      payload: params.payload,
      skipInApp: true,
      pushGroup: {
        actorId: params.actorId,
        actorName: params.actorName,
        moduleId,
        moduleLabel: params.moduleLabel,
        labels: params.groupedPushTitle,
      },
    });
  }
}
