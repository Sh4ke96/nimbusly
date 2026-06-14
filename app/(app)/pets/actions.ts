"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import {
  buildPetCareChangeSummary,
  formatPetCareNotificationDetail,
} from "@/lib/pets/changes";
import {
  isPetCareStockType,
  isValidPetCareName,
  isValidPetCareNotes,
  isValidPetCareQuantity,
  isValidPetCareType,
  isValidPetDateString,
  isValidPetName,
  isValidPetNotes,
  isValidPetSpecies,
  isValidPetStockStatus,
  normalizePetName,
  parsePetCareItemFromForm,
  parsePetFromForm,
  validatePetCareFields,
} from "@/lib/pets/types";
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

async function notifyFamily(
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

async function getFamilyId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  return { profile, familyId };
}

export async function createPet(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const parsed = parsePetFromForm(formData);
  if (!isValidPetName(parsed.name)) return { error: t.pets.errorNameRequired };
  if (!parsed.species) return { error: t.pets.errorSpeciesRequired };
  if (!isValidPetNotes(parsed.notes)) return { error: t.pets.errorGeneric };

  const { profile, familyId } = await getFamilyId(supabase, user.id);
  const name = normalizePetName(parsed.name);

  const { data: pet, error } = await supabase
    .from("pets")
    .insert({
      family_id: familyId,
      name,
      species: parsed.species,
      notes: parsed.notes,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !pet) return { error: t.pets.errorGeneric };

  if (familyId && profile) {
    try {
      await notifyFamily(supabase, {
        type: NOTIFICATION_TYPE.PET_ADDED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        body: `${name}${t.notifications.notificationBodySeparator}${t.pets.speciesLabels[parsed.species]}`,
        payload: {
          pet_id: pet.id,
          pet_name: name,
          actor_id: user.id,
          family_id: familyId,
        },
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.pets.petCreatedSuccess };
}

export async function updatePet(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  const parsed = parsePetFromForm(formData);
  if (!id) return { error: t.pets.errorGeneric };
  if (!isValidPetName(parsed.name)) return { error: t.pets.errorNameRequired };
  if (!parsed.species) return { error: t.pets.errorSpeciesRequired };

  const { data: existing } = await supabase
    .from("pets")
    .select("id, name, species, notes, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.pets.errorNotOwner };

  const name = normalizePetName(parsed.name);
  const { error } = await supabase
    .from("pets")
    .update({
      name,
      species: parsed.species,
      notes: parsed.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.pets.errorGeneric };
  return { success: t.pets.petUpdatedSuccess };
}

export async function deletePet(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  if (!id) return { error: t.pets.errorGeneric };

  const { data: existing } = await supabase
    .from("pets")
    .select("id, name, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.pets.errorNotOwner };

  const { error } = await supabase.from("pets").delete().eq("id", id).eq("created_by", user.id);
  if (error) return { error: t.pets.errorGeneric };

  return { success: t.pets.petDeletedSuccess };
}

function validateCareParsed(
  parsed: ReturnType<typeof parsePetCareItemFromForm>
): string | null {
  if (!parsed.petId) return "pet";
  if (!isValidPetCareName(parsed.name)) return "name";
  if (!parsed.careType) return "careType";
  if (!isValidPetCareQuantity(parsed.quantity)) return "quantity";
  if (!isValidPetCareNotes(parsed.notes)) return "notes";
  if (!isValidPetDateString(parsed.lastDoneAt)) return "lastDone";
  if (!isValidPetDateString(parsed.nextDueDate)) return "nextDue";
  if (!isValidPetStockStatus(parsed.stockStatus)) return "stockStatus";
  if (parsed.careType && validatePetCareFields(parsed.careType, parsed.stockStatus)) {
    return "stockStatus";
  }
  return null;
}

function carePayload(parsed: ReturnType<typeof parsePetCareItemFromForm>) {
  const careType = parsed.careType!;
  const stockType = isPetCareStockType(careType);
  return {
    pet_id: parsed.petId,
    name: normalizePetName(parsed.name),
    care_type: careType,
    last_done_at: parsed.lastDoneAt,
    next_due_date: stockType ? null : parsed.nextDueDate,
    stock_status: stockType ? parsed.stockStatus : null,
    quantity: parsed.quantity,
    notes: parsed.notes,
  };
}

export async function createPetCareItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const parsed = parsePetCareItemFromForm(formData);
  const validationError = validateCareParsed(parsed);
  if (validationError === "pet") return { error: t.pets.errorPetRequired };
  if (validationError === "name") return { error: t.pets.errorCareNameRequired };
  if (validationError === "careType") return { error: t.pets.errorCareTypeRequired };
  if (validationError === "stockStatus") return { error: t.pets.errorStockStatusRequired };
  if (validationError) return { error: t.pets.errorGeneric };

  const { profile, familyId } = await getFamilyId(supabase, user.id);
  const payload = carePayload(parsed);

  const { data: pet } = await supabase
    .from("pets")
    .select("id, name")
    .eq("id", payload.pet_id)
    .maybeSingle();

  if (!pet) return { error: t.pets.errorPetNotFound };

  const { data: item, error } = await supabase
    .from("pet_care_items")
    .insert({ ...payload, family_id: familyId, created_by: user.id })
    .select("id")
    .single();

  if (error || !item) return { error: t.pets.errorGeneric };

  if (familyId && profile) {
    const bodyDetail = formatPetCareNotificationDetail(
      pet.name,
      payload.name,
      t.pets.careTypeLabels[payload.care_type],
      t.pets
    );
    try {
      await notifyFamily(supabase, {
        type: NOTIFICATION_TYPE.PET_CARE_ADDED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        body: bodyDetail,
        payload: {
          pet_care_item_id: item.id,
          pet_id: pet.id,
          actor_id: user.id,
          family_id: familyId,
        },
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.pets.careCreatedSuccess };
}

export async function updatePetCareItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  const parsed = parsePetCareItemFromForm(formData);
  const validationError = validateCareParsed(parsed);
  if (!id) return { error: t.pets.errorGeneric };
  if (validationError === "name") return { error: t.pets.errorCareNameRequired };
  if (validationError === "careType") return { error: t.pets.errorCareTypeRequired };
  if (validationError === "stockStatus") return { error: t.pets.errorStockStatusRequired };
  if (validationError) return { error: t.pets.errorGeneric };

  const { data: existing } = await supabase
    .from("pet_care_items")
    .select("*")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.pets.errorNotOwner };

  const payload = carePayload(parsed);
  const { error } = await supabase
    .from("pet_care_items")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.pets.errorGeneric };

  const { profile, familyId } = await getFamilyId(supabase, user.id);
  if (familyId && profile) {
    const { data: pet } = await supabase
      .from("pets")
      .select("name")
      .eq("id", payload.pet_id)
      .maybeSingle();

    const changeSummary = buildPetCareChangeSummary(existing, payload, t.pets);
    try {
      await notifyFamily(supabase, {
        type: NOTIFICATION_TYPE.PET_CARE_UPDATED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        body: changeSummary,
        payload: {
          pet_care_item_id: id,
          pet_id: payload.pet_id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
        },
      });
    } catch {
      // Best-effort
    }
    void pet;
  }

  return { success: t.pets.careUpdatedSuccess };
}

export async function deletePetCareItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  if (!id) return { error: t.pets.errorGeneric };

  const { data: existing } = await supabase
    .from("pet_care_items")
    .select("id, name, care_type, pet_id, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.pets.errorNotOwner };

  const { error } = await supabase
    .from("pet_care_items")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.pets.errorGeneric };

  const { profile, familyId } = await getFamilyId(supabase, user.id);
  if (familyId && profile && isValidPetCareType(existing.care_type)) {
    const { data: pet } = await supabase
      .from("pets")
      .select("name")
      .eq("id", existing.pet_id)
      .maybeSingle();

    if (pet) {
      const bodyDetail = formatPetCareNotificationDetail(
        pet.name,
        existing.name,
        t.pets.careTypeLabels[existing.care_type],
        t.pets
      );
      try {
        await notifyFamily(supabase, {
          type: NOTIFICATION_TYPE.PET_CARE_DELETED,
          actorId: user.id,
          actorName: getDisplayName(profile),
          familyId,
          body: bodyDetail,
          payload: {
            pet_care_item_id: id,
            pet_id: existing.pet_id,
            actor_id: user.id,
            family_id: familyId,
          },
        });
      } catch {
        // Best-effort
      }
    }
  }

  return { success: t.pets.careDeletedSuccess };
}
