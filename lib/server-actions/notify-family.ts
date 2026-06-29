"use server";

import { getServerT } from "@/lib/i18n/server";
import type { NotificationType } from "@/lib/constants/notifications";
import { notifyModuleSubscribers } from "@/lib/notifications/dispatch-module-notification";
import { getFamilyNotificationTitle } from "@/lib/notifications/family-notification";
import { createClient } from "@/lib/supabase/server";

export async function notifyFamilyMembers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    type: NotificationType;
    actorId: string;
    actorName: string;
    familyId: string;
    body: string;
    payload: Record<string, unknown>;
    onlyRecipientIds?: string[];
  }
) {
  const t = await getServerT();
  const { data: members } = await supabase
    .from("profiles")
    .select("id")
    .eq("family_id", params.familyId);

  const allowed = params.onlyRecipientIds
    ? new Set(params.onlyRecipientIds)
    : null;

  const recipientIds = (members ?? [])
    .map((m) => m.id)
    .filter((id) => id !== params.actorId)
    .filter((id) => (allowed ? allowed.has(id) : true));

  if (recipientIds.length === 0) return;

  const title = getFamilyNotificationTitle(params.type, t.notifications, params.actorName);

  await notifyModuleSubscribers(supabase, {
    type: params.type,
    title,
    body: params.body,
    payload: params.payload,
    actorId: params.actorId,
    recipientIds,
  });
}
