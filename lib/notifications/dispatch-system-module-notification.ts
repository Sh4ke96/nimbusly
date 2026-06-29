import type { NotificationType } from "@/lib/constants/notifications";
import { APP_MODULE } from "@/lib/constants/app-modules";
import type { NotificationModuleId } from "@/lib/constants/notification-modules";
import { dispatchInAppAndPushNotifications } from "@/lib/notifications/dispatch-notifications";
import { loadModulePreferencesForUsers } from "@/lib/notifications/module-preferences/load-module-preferences";
import { partitionRecipientsByChannel } from "@/lib/notifications/module-preferences/filter-recipients-by-channel";
import { getNotificationModuleId } from "@/lib/notifications/module-route";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Json } from "@/lib/supabase/database.types";

type NotifySystemModuleSubscribersParams = {
  moduleId?: NotificationModuleId;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  recipientIds: string[];
};

/** Cron / service role: in-app via create_system_notifications + optional push. */
export async function notifySystemModuleSubscribers(
  supabase: SupabaseClient<Database>,
  params: NotifySystemModuleSubscribersParams
): Promise<void> {
  const moduleId = params.moduleId ?? getNotificationModuleId(params.type);
  if (!moduleId) {
    console.error("[notifications] unknown module for system type", params.type);
    return;
  }

  const recipientIds = [...new Set(params.recipientIds)].filter(Boolean);
  if (recipientIds.length === 0) return;

  const preferences = await loadModulePreferencesForUsers(
    supabase as Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
    recipientIds,
    moduleId
  );
  const { inAppIds, pushIds } = partitionRecipientsByChannel(recipientIds, preferences);

  if (inAppIds.length > 0) {
    const { error } = await supabase.rpc("create_system_notifications", {
      p_recipient_ids: inAppIds,
      p_type: params.type,
      p_title: params.title,
      p_body: params.body,
      p_payload: params.payload as Json,
    });

    if (error) {
      console.error("[notifications] system in-app notify failed", error.message);
    }
  }

  if (pushIds.length > 0) {
    await dispatchInAppAndPushNotifications({
      rpcError: null,
      logContext: "system module push",
      recipientIds: pushIds,
      type: params.type,
      title: params.title,
      body: params.body,
      payload: params.payload,
      skipInApp: true,
    });
  }
}

export async function resolveBudgetReminderRecipientIds(
  supabase: SupabaseClient<Database>,
  budget: { family_id: string | null },
  expenseCreatedBy: string
): Promise<string[]> {
  if (budget.family_id) {
    const { data: members } = await supabase
      .from("profiles")
      .select("id")
      .eq("family_id", budget.family_id);
    return (members ?? []).map((m) => m.id as string);
  }
  return [expenseCreatedBy];
}
