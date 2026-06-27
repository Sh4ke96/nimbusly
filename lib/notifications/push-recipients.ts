import { dispatchPushNotifications } from "@/lib/push/dispatch-push";
import { PUSH_NOTIFICATION_DEFAULT_URL } from "@/lib/constants/push";

export function pushNotificationsToRecipients(params: {
  recipientIds: string[];
  title: string;
  body: string;
  url?: string;
}): void {
  void dispatchPushNotifications({
    recipientIds: params.recipientIds,
    title: params.title,
    body: params.body,
    url: params.url ?? PUSH_NOTIFICATION_DEFAULT_URL,
  }).catch(() => undefined);
}
