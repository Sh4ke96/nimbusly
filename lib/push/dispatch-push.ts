import { createServiceRoleClient } from "@/lib/supabase/admin";
import { buildWebPushPayload } from "@/lib/push/payload";
import { sendWebPushToSubscription } from "@/lib/push/send-web-push";
import { isWebPushConfigured } from "@/lib/push/vapid-config";

type DispatchPushParams = {
  recipientIds: string[];
  title: string;
  body: string;
  url?: string;
};

export async function dispatchPushNotifications(
  params: DispatchPushParams
): Promise<{ sent: number; removed: number }> {
  if (!isWebPushConfigured()) {
    return { sent: 0, removed: 0 };
  }

  const uniqueRecipientIds = [...new Set(params.recipientIds)].filter(Boolean);
  if (uniqueRecipientIds.length === 0) {
    return { sent: 0, removed: 0 };
  }

  const supabase = createServiceRoleClient();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", uniqueRecipientIds);

  if (error || !subscriptions?.length) {
    return { sent: 0, removed: 0 };
  }

  const payload = buildWebPushPayload({
    title: params.title,
    body: params.body,
    url: params.url,
  });

  let sent = 0;
  let removed = 0;

  for (const subscription of subscriptions) {
    const result = await sendWebPushToSubscription(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      payload
    );

    if (result.ok) {
      sent += 1;
      continue;
    }

    if (result.expired) {
      await supabase.from("push_subscriptions").delete().eq("id", subscription.id);
      removed += 1;
    }
  }

  return { sent, removed };
}
