"use server";

import { getServerT } from "@/lib/i18n/server";
import {
  buildWatchlistChangeSummary,
  formatWatchlistNotificationDetail,
} from "@/lib/watchlist/changes";
import {
  isValidWatchlistMediaType,
  isValidWatchlistStatus,
  normalizeWatchlistTitle,
  parseWatchlistIdFromForm,
  parseWatchlistItemFromForm,
  parseWatchlistStatusFromForm,
} from "@/lib/watchlist/types";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser, getProfileFamilyContext } from "@/lib/server-actions/require-user";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";
import { watchlistItemFromRow } from "@/lib/supabase/app-rows";
import { validateWatchlistFields } from "@/lib/watchlist/server/validate-fields";

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
  if (validationError === "streamingPlatforms") {
    return { error: t.watchlist.errorStreamingPlatformsInvalid };
  }
  if (validationError) return { error: t.watchlist.errorGeneric };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

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
      streaming_platforms: parsed.streamingPlatforms!,
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
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.WATCHLIST_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${title}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          watchlist_item_id: item.id,
          watchlist_title: title,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
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

  const id = parseWatchlistIdFromForm(formData);
  const parsed = parseWatchlistItemFromForm(formData);
  const validationError = validateWatchlistFields(parsed);

  if (!id) return { error: t.watchlist.errorGeneric };
  if (validationError === "title") return { error: t.watchlist.errorTitleRequired };
  if (validationError === "mediaType") return { error: t.watchlist.errorMediaTypeRequired };
  if (validationError === "status") return { error: t.watchlist.errorStatusRequired };
  if (validationError === "streamingPlatforms") {
    return { error: t.watchlist.errorStreamingPlatformsInvalid };
  }
  if (validationError) return { error: t.watchlist.errorGeneric };

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id, title, media_type, status, notes, streaming_platforms, family_id, created_by")
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
      streaming_platforms: parsed.streamingPlatforms!,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.watchlist.errorGeneric };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const changeSummary = buildWatchlistChangeSummary(
      watchlistItemFromRow(existing),
      { title, media_type: mediaType, status, notes: parsed.notes, streaming_platforms: parsed.streamingPlatforms! },
      t.watchlist
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.WATCHLIST_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${title}${t.notifications.notificationBodySeparator}${changeSummary}`,
        payload: {
          watchlist_item_id: id,
          watchlist_title: title,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
          updated_at: new Date().toISOString(),
        },
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

  const { id, status: statusRaw } = parseWatchlistStatusFromForm(formData);

  if (!id || !isValidWatchlistStatus(statusRaw)) {
    return { error: t.watchlist.errorStatusRequired };
  }

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id, title, media_type, status, notes, streaming_platforms, family_id, created_by")
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

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const item = watchlistItemFromRow(existing);
    const changeSummary = buildWatchlistChangeSummary(
      item,
      { ...item, status: statusRaw },
      t.watchlist
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.WATCHLIST_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${existing.title}${t.notifications.notificationBodySeparator}${changeSummary}`,
        payload: {
          watchlist_item_id: id,
          watchlist_title: existing.title,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
          updated_at: new Date().toISOString(),
        },
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

  const id = parseWatchlistIdFromForm(formData);
  if (!id) return { error: t.watchlist.errorGeneric };

  const { data: existing } = await supabase
    .from("watchlist_items")
    .select("id, title, media_type, status, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.watchlist.errorNotOwner };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

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
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.WATCHLIST_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${existing.title}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          watchlist_item_id: id,
          watchlist_title: existing.title,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.watchlist.deletedSuccess };
}
