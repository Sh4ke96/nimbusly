import type { NotificationType } from "@/lib/constants/notifications";
import { resolvePushNotificationUrl } from "@/lib/notifications/push-url";
import { pushNotificationsToRecipients } from "@/lib/notifications/push-recipients";

export async function dispatchInAppAndPushNotifications(params: {
  rpcError: { message: string } | null;
  logContext: string;
  recipientIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  skipInApp?: boolean;
}): Promise<void> {
  if (params.rpcError) {
    console.error(`[notifications] ${params.logContext} failed`, params.rpcError.message);
    return;
  }

  if (params.skipInApp === true && params.recipientIds.length === 0) return;
  if (params.recipientIds.length === 0) return;

  await pushNotificationsToRecipients({
    recipientIds: params.recipientIds,
    title: params.title,
    body: params.body,
    url: resolvePushNotificationUrl(params.type, params.payload),
  });
}
