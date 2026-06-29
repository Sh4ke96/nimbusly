import { createServiceRoleClient } from "@/lib/supabase/admin";
import { shouldSuppressPushForQuietHours } from "@/lib/notifications/quiet-hours";
import { dispatchPushNotifications } from "@/lib/push/dispatch-push";
import { PUSH_NOTIFICATION_DEFAULT_URL } from "@/lib/constants/push";

async function filterRecipientsOutsideQuietHours(recipientIds: string[]): Promise<string[]> {
  if (recipientIds.length === 0) return recipientIds;

  try {
    const supabase = createServiceRoleClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select(
        "id, notification_quiet_hours_enabled, notification_quiet_start, notification_quiet_end"
      )
      .in("id", recipientIds);

    const byId = new Map((profiles ?? []).map((row) => [row.id as string, row]));

    return recipientIds.filter((id) => {
      const profile = byId.get(id);
      if (!profile) return true;
      return !shouldSuppressPushForQuietHours({
        enabled: profile.notification_quiet_hours_enabled === true,
        quietStart: profile.notification_quiet_start ?? "22:00",
        quietEnd: profile.notification_quiet_end ?? "07:00",
      });
    });
  } catch {
    return recipientIds;
  }
}

/** Await push dispatch so serverless handlers do not exit before send completes. */
export async function pushNotificationsToRecipients(params: {
  recipientIds: string[];
  title: string;
  body: string;
  url?: string;
}): Promise<void> {
  const recipientIds = await filterRecipientsOutsideQuietHours(params.recipientIds);
  if (recipientIds.length === 0) return;

  try {
    await dispatchPushNotifications({
      recipientIds,
      title: params.title,
      body: params.body,
      url: params.url ?? PUSH_NOTIFICATION_DEFAULT_URL,
    });
  } catch (error) {
    console.error("[push] dispatch failed", error);
  }
}
