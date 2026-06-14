"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { buildGiftChangeSummary, formatGiftNotificationDetail } from "@/lib/gifts/changes";
import {
  isValidGiftContent,
  isValidGiftRecipientType,
  isValidRecipientName,
  normalizeRecipientName,
  parseGiftRecipientFromForm,
} from "@/lib/gifts/types";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import { NOTIFICATION_TYPE, type NotificationType } from "@/lib/constants/notifications";
import { getFamilyNotificationTitle } from "@/lib/notifications/family-notification";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function notifyFamilyAboutGiftEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    type: NotificationType;
    actorId: string;
    actorName: string;
    familyId: string;
    giftId: string;
    recipientName: string;
    bodyDetail: string;
    changeSummary?: string;
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

  const title = getFamilyNotificationTitle(params.type, t.notifications, params.actorName);
  const body = `${params.recipientName}${t.notifications.notificationBodySeparator}${params.bodyDetail}`;

  await supabase.rpc("create_family_notifications", {
    p_recipient_ids: recipientIds,
    p_type: params.type,
    p_title: title,
    p_body: body,
    p_payload: {
      gift_id: params.giftId,
      recipient_name: params.recipientName,
      actor_id: params.actorId,
      family_id: params.familyId,
      change_summary: params.changeSummary ?? null,
      updated_at: new Date().toISOString(),
    },
  });
}

async function resolveRecipientForInsert(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    recipientType: string;
    recipientMemberId: string | null;
    recipientName: string;
    familyId: string | null;
  }
): Promise<{ recipientType: string; recipientMemberId: string | null; recipientName: string } | null> {
  if (!isValidGiftRecipientType(params.recipientType)) return null;

  if (params.recipientType === GIFT_RECIPIENT_TYPE.CUSTOM) {
    if (!isValidRecipientName(params.recipientName)) return null;
    return {
      recipientType: GIFT_RECIPIENT_TYPE.CUSTOM,
      recipientMemberId: null,
      recipientName: normalizeRecipientName(params.recipientName),
    };
  }

  if (!params.familyId || !params.recipientMemberId) return null;

  const { data: member } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, family_id")
    .eq("id", params.recipientMemberId)
    .eq("family_id", params.familyId)
    .maybeSingle();

  if (!member) return null;

  return {
    recipientType: GIFT_RECIPIENT_TYPE.FAMILY_MEMBER,
    recipientMemberId: member.id,
    recipientName: getDisplayName(member),
  };
}

export async function createGiftIdea(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const content = (formData.get("content") as string)?.trim() ?? "";
  const parsed = parseGiftRecipientFromForm(formData);

  if (!parsed.recipientType) return { error: t.gifts.errorInvalidRecipient };
  if (!isValidGiftContent(content)) return { error: t.gifts.errorContentRequired };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const recipient = await resolveRecipientForInsert(supabase, {
    recipientType: parsed.recipientType,
    recipientMemberId: parsed.recipientMemberId,
    recipientName: parsed.recipientName,
    familyId,
  });

  if (!recipient) return { error: t.gifts.errorInvalidRecipient };

  if (!familyId && recipient.recipientType === GIFT_RECIPIENT_TYPE.FAMILY_MEMBER) {
    return { error: t.gifts.errorInvalidRecipient };
  }

  const { data: gift, error } = await supabase
    .from("gift_ideas")
    .insert({
      family_id: familyId,
      recipient_type: recipient.recipientType,
      recipient_member_id: recipient.recipientMemberId,
      recipient_name: recipient.recipientName,
      content,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !gift) return { error: t.gifts.errorGeneric };

  if (familyId) {
    const actorName = profile ? getDisplayName(profile) : user.email ?? "Nimbusly";
    const bodyDetail = formatGiftNotificationDetail(
      recipient.recipientName,
      content,
      t.gifts
    );

    try {
      await notifyFamilyAboutGiftEvent(supabase, {
        type: NOTIFICATION_TYPE.GIFT_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        giftId: gift.id,
        recipientName: recipient.recipientName,
        bodyDetail,
      });
    } catch {
      // Saved; notifications are best-effort
    }
  }

  return { success: t.gifts.createdSuccess };
}

export async function updateGiftIdea(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  const content = (formData.get("content") as string)?.trim() ?? "";
  const parsed = parseGiftRecipientFromForm(formData);

  if (!id) return { error: t.gifts.errorGeneric };
  if (!parsed.recipientType) return { error: t.gifts.errorInvalidRecipient };
  if (!isValidGiftContent(content)) return { error: t.gifts.errorContentRequired };

  const { data: existing } = await supabase
    .from("gift_ideas")
    .select("id, recipient_type, recipient_member_id, recipient_name, content, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.gifts.errorNotOwner };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const recipient = await resolveRecipientForInsert(supabase, {
    recipientType: parsed.recipientType,
    recipientMemberId: parsed.recipientMemberId,
    recipientName: parsed.recipientName,
    familyId: existing.family_id,
  });

  if (!recipient) return { error: t.gifts.errorInvalidRecipient };

  const { error } = await supabase
    .from("gift_ideas")
    .update({
      recipient_type: recipient.recipientType,
      recipient_member_id: recipient.recipientMemberId,
      recipient_name: recipient.recipientName,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.gifts.errorGeneric };

  const changeSummary = buildGiftChangeSummary(
    existing,
    {
      recipient_name: recipient.recipientName,
      content,
    },
    t.gifts
  );

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    try {
      await notifyFamilyAboutGiftEvent(supabase, {
        type: NOTIFICATION_TYPE.GIFT_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        giftId: id,
        recipientName: recipient.recipientName,
        bodyDetail: changeSummary,
        changeSummary,
      });
    } catch {
      // Updated; notifications are best-effort
    }
  }

  return { success: t.gifts.updatedSuccess };
}

export async function deleteGiftIdea(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  if (!id) return { error: t.gifts.errorGeneric };

  const { data: existing } = await supabase
    .from("gift_ideas")
    .select("id, recipient_name, content, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.gifts.errorNotOwner };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("gift_ideas")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.gifts.errorGeneric };

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const bodyDetail = formatGiftNotificationDetail(
      existing.recipient_name,
      existing.content,
      t.gifts
    );

    try {
      await notifyFamilyAboutGiftEvent(supabase, {
        type: NOTIFICATION_TYPE.GIFT_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        giftId: id,
        recipientName: existing.recipient_name,
        bodyDetail,
      });
    } catch {
      // Deleted; notifications are best-effort
    }
  }

  return { success: t.gifts.deletedSuccess };
}
