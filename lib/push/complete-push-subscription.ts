import {
  enablePushAfterBrowserSubscription,
  savePushSubscription,
  type PushSubscriptionInput,
} from "@/app/(app)/push/actions";

export type CompletePushSubscriptionResult =
  | { ok: true }
  | { ok: false; error: "save" | "prefs" };

export async function completePushSubscription(
  subscription: PushSubscriptionInput,
  userAgent: string | null
): Promise<CompletePushSubscriptionResult> {
  const saveResult = await savePushSubscription(subscription, userAgent);
  if (saveResult?.error) {
    return { ok: false, error: "save" };
  }

  const prefsResult = await enablePushAfterBrowserSubscription();
  if (prefsResult?.error) {
    return { ok: false, error: "prefs" };
  }

  return { ok: true };
}
