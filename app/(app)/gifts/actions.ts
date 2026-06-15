"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { buildGiftChangeSummary, formatGiftNotificationDetail } from "@/lib/gifts/changes";
import {
  isValidGiftContent,
  isValidGiftRecipientType,
  isValidRecipientName,
  normalizeRecipientName,
  parseGiftContentFromForm,
  parseGiftIdFromForm,
  parseGiftRecipientFromForm,
  parseGiftVisibleMemberIdsFromForm,
} from "@/lib/gifts/types";
import { isValidGiftLinkUrl, normalizeGiftLinkUrl } from "@/lib/gifts/url";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser, getProfileFamilyContext } from "@/lib/server-actions/require-user";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";

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

async function resolveVisibleMemberIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string,
  memberIds: string[]
): Promise<string[] | null> {
  if (memberIds.length === 0) return [];

  const unique = [...new Set(memberIds)];
  const { data: members } = await supabase
    .from("profiles")
    .select("id")
    .eq("family_id", familyId)
    .in("id", unique);

  if (!members || members.length !== unique.length) return null;
  return unique;
}

function parseLinkUrlFromForm(formData: FormData): string | null | undefined {
  const raw = formData.get("linkUrl");
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = normalizeGiftLinkUrl(trimmed);
  return isValidGiftLinkUrl(normalized) ? normalized : undefined;
}

export async function createGiftIdea(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { content } = parseGiftContentFromForm(formData);
  const parsed = parseGiftRecipientFromForm(formData);
  const linkUrl = parseLinkUrlFromForm(formData);

  if (!parsed.recipientType) return { error: t.gifts.errorInvalidRecipient };
  if (!isValidGiftContent(content)) return { error: t.gifts.errorContentRequired };
  if (linkUrl === undefined) return { error: t.gifts.errorInvalidLinkUrl };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

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

  let visibleToMemberIds: string[] = [];
  if (familyId) {
    const visibleRaw = parseGiftVisibleMemberIdsFromForm(formData);
    if (visibleRaw === null) return { error: t.gifts.errorInvalidVisibility };
    const resolved = await resolveVisibleMemberIds(supabase, familyId, visibleRaw);
    if (resolved === null) return { error: t.gifts.errorInvalidVisibility };
    visibleToMemberIds = resolved;
  }

  const { data: gift, error } = await supabase
    .from("gift_ideas")
    .insert({
      family_id: familyId,
      recipient_type: recipient.recipientType,
      recipient_member_id: recipient.recipientMemberId,
      recipient_name: recipient.recipientName,
      content,
      link_url: linkUrl,
      visible_to_member_ids: visibleToMemberIds,
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
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.GIFT_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${recipient.recipientName}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          gift_id: gift.id,
          recipient_name: recipient.recipientName,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
        onlyRecipientIds:
          visibleToMemberIds.length > 0 ? visibleToMemberIds : undefined,
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

  const id = parseGiftIdFromForm(formData);
  const { content } = parseGiftContentFromForm(formData);
  const parsed = parseGiftRecipientFromForm(formData);
  const linkUrl = parseLinkUrlFromForm(formData);

  if (!id) return { error: t.gifts.errorGeneric };
  if (!parsed.recipientType) return { error: t.gifts.errorInvalidRecipient };
  if (!isValidGiftContent(content)) return { error: t.gifts.errorContentRequired };
  if (linkUrl === undefined) return { error: t.gifts.errorInvalidLinkUrl };

  const { data: existing } = await supabase
    .from("gift_ideas")
    .select(
      "id, recipient_type, recipient_member_id, recipient_name, content, link_url, visible_to_member_ids, family_id, created_by"
    )
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.gifts.errorNotOwner };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const recipient = await resolveRecipientForInsert(supabase, {
    recipientType: parsed.recipientType,
    recipientMemberId: parsed.recipientMemberId,
    recipientName: parsed.recipientName,
    familyId: existing.family_id,
  });

  if (!recipient) return { error: t.gifts.errorInvalidRecipient };

  let visibleToMemberIds: string[] = [];
  if (existing.family_id) {
    const visibleRaw = parseGiftVisibleMemberIdsFromForm(formData);
    if (visibleRaw === null) return { error: t.gifts.errorInvalidVisibility };
    const resolved = await resolveVisibleMemberIds(supabase, existing.family_id, visibleRaw);
    if (resolved === null) return { error: t.gifts.errorInvalidVisibility };
    visibleToMemberIds = resolved;
  }

  const { error } = await supabase
    .from("gift_ideas")
    .update({
      recipient_type: recipient.recipientType,
      recipient_member_id: recipient.recipientMemberId,
      recipient_name: recipient.recipientName,
      content,
      link_url: linkUrl,
      visible_to_member_ids: visibleToMemberIds,
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
      link_url: linkUrl,
    },
    t.gifts
  );

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.GIFT_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${recipient.recipientName}${t.notifications.notificationBodySeparator}${changeSummary}`,
        payload: {
          gift_id: id,
          recipient_name: recipient.recipientName,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
          updated_at: new Date().toISOString(),
        },
        onlyRecipientIds:
          visibleToMemberIds.length > 0 ? visibleToMemberIds : undefined,
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

  const id = parseGiftIdFromForm(formData);
  if (!id) return { error: t.gifts.errorGeneric };

  const { data: existing } = await supabase
    .from("gift_ideas")
    .select("id, recipient_name, content, family_id, created_by, visible_to_member_ids")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.gifts.errorNotOwner };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

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
    const visibleToMemberIds = existing.visible_to_member_ids ?? [];

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.GIFT_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${existing.recipient_name}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          gift_id: id,
          recipient_name: existing.recipient_name,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
        onlyRecipientIds:
          visibleToMemberIds.length > 0 ? visibleToMemberIds : undefined,
      });
    } catch {
      // Deleted; notifications are best-effort
    }
  }

  return { success: t.gifts.deletedSuccess };
}
