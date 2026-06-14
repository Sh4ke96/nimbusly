"use server";

import { getServerT } from "@/lib/i18n/server";
import type { NotificationType } from "@/lib/constants/notifications";
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
  }
) {
  const t = await getServerT();
  const { data: members } = await supabase
    .from("profiles")
    .select("id")
    .eq("family_id", params.familyId);

  const recipientIds = (members ?? [])
    .map((m) => m.id as string)
    .filter((id) => id !== params.actorId);

  if (recipientIds.length === 0) return;

  await supabase.rpc("create_family_notifications", {
    p_recipient_ids: recipientIds,
    p_type: params.type,
    p_title: getFamilyNotificationTitle(params.type, t.notifications, params.actorName),
    p_body: params.body,
    p_payload: params.payload,
  });
}
