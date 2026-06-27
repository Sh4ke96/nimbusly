import { dispatchPushNotifications } from "@/lib/push/dispatch-push";
import { PUSH_NOTIFICATION_DEFAULT_URL } from "@/lib/constants/push";

/** Await push dispatch so serverless handlers do not exit before send completes. */
export async function pushNotificationsToRecipients(params: {
  recipientIds: string[];
  title: string;
  body: string;
  url?: string;
}): Promise<void> {
  try {
    await dispatchPushNotifications({
      recipientIds: params.recipientIds,
      title: params.title,
      body: params.body,
      url: params.url ?? PUSH_NOTIFICATION_DEFAULT_URL,
    });
  } catch (error) {
    console.error("[push] dispatch failed", error);
  }
}
