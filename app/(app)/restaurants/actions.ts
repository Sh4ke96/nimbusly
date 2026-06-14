"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import {
  buildRestaurantChangeSummary,
  formatRestaurantNotificationDetail,
} from "@/lib/restaurants/changes";
import {
  isValidRestaurantAddress,
  isValidRestaurantComment,
  isValidRestaurantName,
  isValidRestaurantNotes,
  isValidRestaurantRating,
  isValidRestaurantVenueType,
  isValidRestaurantVisitStatus,
  normalizeRestaurantAddress,
  normalizeRestaurantName,
  parseRestaurantPlaceFromForm,
  validateRestaurantVisitFields,
} from "@/lib/restaurants/types";
import { RESTAURANT_VISIT_STATUS } from "@/lib/constants/restaurants";
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

async function notifyFamilyAboutRestaurantEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    type: NotificationType;
    actorId: string;
    actorName: string;
    familyId: string;
    placeId: string;
    name: string;
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
  const body = `${params.name}${t.notifications.notificationBodySeparator}${params.bodyDetail}`;

  await supabase.rpc("create_family_notifications", {
    p_recipient_ids: recipientIds,
    p_type: params.type,
    p_title: title,
    p_body: body,
    p_payload: {
      restaurant_place_id: params.placeId,
      restaurant_name: params.name,
      actor_id: params.actorId,
      family_id: params.familyId,
      change_summary: params.changeSummary ?? null,
      updated_at: new Date().toISOString(),
    },
  });
}

function validateRestaurantFields(
  parsed: ReturnType<typeof parseRestaurantPlaceFromForm>
): string | null {
  if (!isValidRestaurantName(parsed.name)) return "name";
  if (!parsed.venueType) return "venueType";
  if (!parsed.visitStatus) return "visitStatus";
  if (!isValidRestaurantAddress(parsed.address)) return "address";
  if (!isValidRestaurantComment(parsed.comment)) return "comment";
  if (!isValidRestaurantNotes(parsed.notes)) return "notes";

  const visitError = validateRestaurantVisitFields(
    parsed.visitStatus,
    parsed.rating,
    parsed.visitedAt
  );
  if (visitError) return visitError;

  if (parsed.rating !== null && !isValidRestaurantRating(parsed.rating)) {
    return "rating";
  }

  return null;
}

function toDbPayload(parsed: ReturnType<typeof parseRestaurantPlaceFromForm>) {
  const visitStatus = parsed.visitStatus!;
  const isVisited = visitStatus === RESTAURANT_VISIT_STATUS.VISITED;

  return {
    name: normalizeRestaurantName(parsed.name),
    venue_type: parsed.venueType!,
    visit_status: visitStatus,
    rating: isVisited ? parsed.rating : null,
    comment: parsed.comment,
    notes: parsed.notes,
    address: normalizeRestaurantAddress(parsed.address),
    visited_at: isVisited ? parsed.visitedAt : null,
  };
}

export async function createRestaurantPlace(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const parsed = parseRestaurantPlaceFromForm(formData);
  const validationError = validateRestaurantFields(parsed);

  if (validationError === "name") return { error: t.restaurants.errorNameRequired };
  if (validationError === "venueType") return { error: t.restaurants.errorVenueTypeRequired };
  if (validationError === "visitStatus") return { error: t.restaurants.errorVisitStatusRequired };
  if (validationError === "address") return { error: t.restaurants.errorAddressRequired };
  if (validationError === "rating") return { error: t.restaurants.errorRatingRequired };
  if (validationError === "visitedAt") return { error: t.restaurants.errorVisitedAtRequired };
  if (validationError) return { error: t.restaurants.errorGeneric };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const payload = toDbPayload(parsed);

  const { data: place, error } = await supabase
    .from("restaurant_places")
    .insert({
      family_id: familyId,
      ...payload,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !place) return { error: t.restaurants.errorGeneric };

  if (familyId && profile) {
    const actorName = getDisplayName(profile);
    const bodyDetail = formatRestaurantNotificationDetail(
      payload.name,
      t.restaurants.venueTypeLabels[payload.venue_type],
      t.restaurants.visitStatusLabels[payload.visit_status],
      t.restaurants
    );

    try {
      await notifyFamilyAboutRestaurantEvent(supabase, {
        type: NOTIFICATION_TYPE.RESTAURANT_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        placeId: place.id,
        name: payload.name,
        bodyDetail,
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.restaurants.createdSuccess };
}

export async function updateRestaurantPlace(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  const parsed = parseRestaurantPlaceFromForm(formData);
  const validationError = validateRestaurantFields(parsed);

  if (!id) return { error: t.restaurants.errorGeneric };
  if (validationError === "name") return { error: t.restaurants.errorNameRequired };
  if (validationError === "venueType") return { error: t.restaurants.errorVenueTypeRequired };
  if (validationError === "visitStatus") return { error: t.restaurants.errorVisitStatusRequired };
  if (validationError === "address") return { error: t.restaurants.errorAddressRequired };
  if (validationError === "rating") return { error: t.restaurants.errorRatingRequired };
  if (validationError === "visitedAt") return { error: t.restaurants.errorVisitedAtRequired };
  if (validationError) return { error: t.restaurants.errorGeneric };

  const { data: existing } = await supabase
    .from("restaurant_places")
    .select(
      "id, name, venue_type, visit_status, rating, comment, notes, address, visited_at, family_id, created_by"
    )
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.restaurants.errorNotOwner };

  const payload = toDbPayload(parsed);

  const { error } = await supabase
    .from("restaurant_places")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.restaurants.errorGeneric };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const changeSummary = buildRestaurantChangeSummary(existing, payload, t.restaurants);

    try {
      await notifyFamilyAboutRestaurantEvent(supabase, {
        type: NOTIFICATION_TYPE.RESTAURANT_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        placeId: id,
        name: payload.name,
        bodyDetail: changeSummary,
        changeSummary,
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.restaurants.updatedSuccess };
}

export async function deleteRestaurantPlace(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  if (!id) return { error: t.restaurants.errorGeneric };

  const { data: existing } = await supabase
    .from("restaurant_places")
    .select("id, name, venue_type, visit_status, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.restaurants.errorNotOwner };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("restaurant_places")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.restaurants.errorGeneric };

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const venueTypeLabel = isValidRestaurantVenueType(existing.venue_type)
      ? t.restaurants.venueTypeLabels[existing.venue_type]
      : existing.venue_type;
    const visitStatusLabel = isValidRestaurantVisitStatus(existing.visit_status)
      ? t.restaurants.visitStatusLabels[existing.visit_status]
      : existing.visit_status;
    const bodyDetail = formatRestaurantNotificationDetail(
      existing.name,
      venueTypeLabel,
      visitStatusLabel,
      t.restaurants
    );

    try {
      await notifyFamilyAboutRestaurantEvent(supabase, {
        type: NOTIFICATION_TYPE.RESTAURANT_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        placeId: id,
        name: existing.name,
        bodyDetail,
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.restaurants.deletedSuccess };
}
