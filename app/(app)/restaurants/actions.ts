"use server";

import { getServerT } from "@/lib/i18n/server";
import {
  buildRestaurantChangeSummary,
  formatRestaurantNotificationDetail,
} from "@/lib/restaurants/changes";
import {
  isValidRestaurantVenueType,
  isValidRestaurantVisitStatus,
  normalizeRestaurantAddress,
  normalizeRestaurantName,
  parseRestaurantIdFromForm,
  parseRestaurantPlaceFromForm,
} from "@/lib/restaurants/types";
import { RESTAURANT_VISIT_STATUS } from "@/lib/constants/restaurants";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser, getProfileFamilyContext } from "@/lib/server-actions/require-user";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";
import { restaurantPlaceFromRow } from "@/lib/supabase/app-rows";
import { validateRestaurantFields } from "@/lib/restaurants/server/validate-fields";

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

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

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
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.RESTAURANT_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${payload.name}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          restaurant_place_id: place.id,
          restaurant_name: payload.name,
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

  return { success: t.restaurants.createdSuccess };
}

export async function updateRestaurantPlace(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseRestaurantIdFromForm(formData);
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

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const changeSummary = buildRestaurantChangeSummary(
      restaurantPlaceFromRow(existing), payload, t.restaurants);

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.RESTAURANT_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${payload.name}${t.notifications.notificationBodySeparator}${changeSummary}`,
        payload: {
          restaurant_place_id: id,
          restaurant_name: payload.name,
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

  return { success: t.restaurants.updatedSuccess };
}

export async function deleteRestaurantPlace(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseRestaurantIdFromForm(formData);
  if (!id) return { error: t.restaurants.errorGeneric };

  const { data: existing } = await supabase
    .from("restaurant_places")
    .select("id, name, venue_type, visit_status, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.restaurants.errorNotOwner };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

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
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.RESTAURANT_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${existing.name}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          restaurant_place_id: id,
          restaurant_name: existing.name,
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

  return { success: t.restaurants.deletedSuccess };
}
