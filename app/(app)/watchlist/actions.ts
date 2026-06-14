"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import {
  buildWatchlistChangeSummary,
  formatWatchlistNotificationDetail,
} from "@/lib/watchlist/changes";
import {
  isValidWatchlistMediaType,
  isValidWatchlistNotes,
  isValidWatchlistStatus,
  isValidWatchlistTitle,
  normalizeWatchlistTitle,
  parseWatchlistItemFromForm,
} from "@/lib/watchlist/types";
import { ACCOUNT_MODE } from "@/lib/constants/account";
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

async function notifyFamilyAboutWatchlistEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    type: NotificationType;
    actorId: string;
    actorName: string;
    familyId: string;
    itemId: string;
    title: string;
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
  const body = `${params.title}${t.notifications.notificationBodySeparator}${params.bodyDetail}`;

  await supabase.rpc("create_family_notifications", {
    p_recipient_ids: recipientIds,
    p_type: params.type,
    p_title: title,
    p_body: body,
    p_payload: {
      watchlist_item_id: params.itemId,
      watchlist_title: params.title,
      actor_id: params.actorId,
      family_id: params.familyId,
      change_summary: params.changeSummary ?? null,
      updated_at: new Date().toISOString(),
    },
  });
}

function validateWatchlistFields(
  parsed: ReturnType<typeof parseWatchlistItemFromForm>
): string | null {
  if (!isValidWatchlistTitle(parsed.title)) return "title";
  if (!parsed.mediaType) return "mediaType";
  if (!parsed.status) return "status";
  if (!isValidWatchlistNotes(parsed.notes)) return "notes";
  return null;
}

export async function createWatchlistItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const parsed = parseWatchlistItemFromForm(formData);
  const validationError = validateWatchlistFields(parsed);

  if (validationError === "title") return { error: t.watchlist.errorTitleRequired };
  if (validationError === "mediaType") return { error: t.watchlist.errorMediaTypeRequired };
  if (validationError === "status") return { error: t.watchlist.errorStatusRequired };
  if (validationError) return { error: t.watchlist.errorGeneric };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const mediaType = parsed.mediaType!;
  const status = parsed.status!;
  const title = normalizeWatchlistTitle(parsed.title);

  const { data: item, error } = await supabase
    .from("watchlist_items")
    .insert({
      family_id: familyId,
      title,
      media_type: mediaType,
      status,
      notes: parsed.notes,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !item) return { error: t.watchlist.errorGeneric };

  if (familyId && profile) {
    const actorName = getDisplayName(profile);
    const bodyDetail = formatWatchlistNotificationDetail(
      title,
      t.watchlist.mediaTypeLabels[mediaType],
      t.watchlist.statusLabels[status],
      t.watchlist
    );

    try {
      await notifyFamilyAboutWatchlistEvent(supabase, {
        type: NOTIFICATION_TYPE.WATCHLIST_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        itemId: item.id,
        title,
        bodyDetail,
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.watchlist.createdSuccess };
}

export async function updateWatchlistItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  const parsed = parseWatchlistItemFromForm(formData);
  const validationError = validateWatchlistFields(parsed);

  if (!id) return { error: t.watchlist.errorGeneric };
  if (validationError === "title") return { error: t.watchlist.errorTitleRequired };
  if (validationError === "mediaType") return { error: t.watchlist.errorMediaTypeRequired };
  if (validationError === "status") return { error: t.watchlist.errorStatusRequired };
  if (validationError) return { error: t.watchlist.errorGeneric };

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id, title, media_type, status, notes, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.watchlist.errorNotOwner };

  const mediaType = parsed.mediaType!;
  const status = parsed.status!;
  const title = normalizeWatchlistTitle(parsed.title);

  const { error } = await supabase
    .from("watchlist_items")
    .update({
      title,
      media_type: mediaType,
      status,
      notes: parsed.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.watchlist.errorGeneric };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const changeSummary = buildWatchlistChangeSummary(
      existing,
      { title, media_type: mediaType, status, notes: parsed.notes },
      t.watchlist
    );

    try {
      await notifyFamilyAboutWatchlistEvent(supabase, {
        type: NOTIFICATION_TYPE.WATCHLIST_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        itemId: id,
        title,
        bodyDetail: changeSummary,
        changeSummary,
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.watchlist.updatedSuccess };
}

export async function setWatchlistItemStatus(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  const statusRaw = (formData.get("status") as string)?.trim() ?? "";

  if (!id || !isValidWatchlistStatus(statusRaw)) {
    return { error: t.watchlist.errorStatusRequired };
  }

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id, title, media_type, status, notes, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.watchlist.errorNotOwner };
  if (existing.status === statusRaw) {
    return { success: t.watchlist.updatedSuccess };
  }

  const { error } = await supabase
    .from("watchlist_items")
    .update({
      status: statusRaw,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.watchlist.errorGeneric };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const changeSummary = buildWatchlistChangeSummary(
      existing,
      { ...existing, status: statusRaw },
      t.watchlist
    );

    try {
      await notifyFamilyAboutWatchlistEvent(supabase, {
        type: NOTIFICATION_TYPE.WATCHLIST_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        itemId: id,
        title: existing.title,
        bodyDetail: changeSummary,
        changeSummary,
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.watchlist.updatedSuccess };
}

export async function deleteWatchlistItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  if (!id) return { error: t.watchlist.errorGeneric };

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id, title, media_type, status, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.watchlist.errorNotOwner };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.watchlist.errorGeneric };

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const mediaTypeLabel = isValidWatchlistMediaType(existing.media_type)
      ? t.watchlist.mediaTypeLabels[existing.media_type]
      : existing.media_type;
    const statusLabel = isValidWatchlistStatus(existing.status)
      ? t.watchlist.statusLabels[existing.status]
      : existing.status;
    const bodyDetail = formatWatchlistNotificationDetail(
      existing.title,
      mediaTypeLabel,
      statusLabel,
      t.watchlist
    );

    try {
      await notifyFamilyAboutWatchlistEvent(supabase, {
        type: NOTIFICATION_TYPE.WATCHLIST_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        itemId: id,
        title: existing.title,
        bodyDetail,
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.watchlist.deletedSuccess };
}
