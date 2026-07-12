"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import {
  buildMedicineChangeSummary,
  formatMedicineNotificationDetail,
} from "@/lib/medicine/changes";
import { isMedicineExpiringSoon } from "@/lib/medicine/expiry";
import {
  isValidMedicineExpiryDate,
  isValidMedicineFormType,
  isValidMedicineLocation,
  isValidMedicineName,
  isValidMedicineNotes,
  isValidMedicineQuantity,
  normalizeMedicineName,
  parseMedicineIdFromForm,
  parseMedicineItemFromForm,
} from "@/lib/medicine/types";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName, type Profile } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser, getProfileFamilyContext } from "@/lib/server-actions/require-user";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";
import { resolveAssigneeNotificationRecipients } from "@/lib/family/assignee-visibility";
import { medicineItemFromRow } from "@/lib/supabase/app-rows";

async function validateTakenBy(
  supabase: Awaited<ReturnType<typeof createClient>>,
  takenBy: string | null,
  familyId: string | null
): Promise<boolean> {
  if (!takenBy) return true;
  if (!familyId) return false;
  const { data: member } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", takenBy)
    .eq("family_id", familyId)
    .maybeSingle();
  return !!member;
}

function resolveTakenByLabel(
  id: string | null,
  profile: Pick<Profile, "id" | "first_name" | "last_name"> | null,
  members: { id: string; first_name: string | null; last_name: string | null }[],
  unassignedLabel: string
): string {
  if (!id) return unassignedLabel;
  if (profile && profile.id === id) {
    return getDisplayName({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
    });
  }
  const member = members.find((m) => m.id === id);
  if (!member) return unassignedLabel;
  return getDisplayName({
    first_name: member.first_name ?? "",
    last_name: member.last_name ?? "",
  });
}

function resolveTakenByForSave(
  takenBy: string | null,
  familyId: string | null,
  userId: string
): string | null {
  if (!familyId) return userId;
  return takenBy;
}

function validateMedicineFields(parsed: ReturnType<typeof parseMedicineItemFromForm>): string | null {
  if (!isValidMedicineName(parsed.name)) return "name";
  if (!parsed.formType) return "form";
  if (!isValidMedicineQuantity(parsed.quantity)) return "quantity";
  if (!isValidMedicineExpiryDate(parsed.expiryDate)) return "expiry";
  if (!parsed.availability) return "availability";
  if (!isValidMedicineLocation(parsed.location)) return "location";
  if (!isValidMedicineNotes(parsed.notes)) return "notes";
  return null;
}

async function maybeNotifyExpiring(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    actorId: string;
    actorName: string;
    familyId: string;
    itemId: string;
    itemName: string;
    formLabel: string;
    expiryDate: string | null;
    takenBy: string | null;
  }
) {
  if (!params.expiryDate || !isMedicineExpiringSoon(params.expiryDate)) return;

  const t = await getServerT();
  const bodyDetail = formatMedicineNotificationDetail(
    params.itemName,
    params.formLabel,
    t.medicineCabinet
  );

  try {
    await notifyFamilyMembers(supabase, {
      type: NOTIFICATION_TYPE.MEDICINE_EXPIRING,
      actorId: params.actorId,
      actorName: params.actorName,
      familyId: params.familyId,
      body: `${params.itemName}${t.notifications.notificationBodySeparator}${bodyDetail}`,
      payload: {
        medicine_item_id: params.itemId,
        medicine_name: params.itemName,
        actor_id: params.actorId,
        family_id: params.familyId,
        change_summary: null,
        expiry_date: params.expiryDate ?? null,
        updated_at: new Date().toISOString(),
      },
      onlyRecipientIds: resolveAssigneeNotificationRecipients(params.takenBy),
    });
  } catch {
    // Best-effort
  }
}

export async function createMedicineItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const parsed = parseMedicineItemFromForm(formData);
  const validationError = validateMedicineFields(parsed);

  if (validationError === "name") return { error: t.medicineCabinet.errorNameRequired };
  if (validationError === "form") return { error: t.medicineCabinet.errorFormRequired };
  if (validationError === "expiry") return { error: t.medicineCabinet.errorInvalidExpiry };
  if (validationError === "availability") return { error: t.medicineCabinet.errorAvailabilityRequired };
  if (validationError) return { error: t.medicineCabinet.errorGeneric };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

  const formType = parsed.formType!;
  const availability = parsed.availability!;

  const takenBy = resolveTakenByForSave(parsed.takenBy, familyId, user.id);
  if (!(await validateTakenBy(supabase, takenBy, familyId))) {
    return { error: t.medicineCabinet.errorInvalidTakenBy };
  }

  const { data: item, error } = await supabase
    .from("medicine_items")
    .insert({
      family_id: familyId,
      name: normalizeMedicineName(parsed.name),
      form_type: formType,
      quantity: parsed.quantity,
      expiry_date: parsed.expiryDate,
      availability,
      location: parsed.location,
      notes: parsed.notes,
      taken_by: takenBy,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !item) return { error: t.medicineCabinet.errorGeneric };

  if (familyId && profile) {
    const actorName = getDisplayName(profile);
    const formLabel = t.medicineCabinet.formLabels[formType];
    const bodyDetail = formatMedicineNotificationDetail(
      parsed.name,
      formLabel,
      t.medicineCabinet
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.MEDICINE_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${normalizeMedicineName(parsed.name)}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          medicine_item_id: item.id,
          medicine_name: normalizeMedicineName(parsed.name),
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          expiry_date: parsed.expiryDate ?? null,
          updated_at: new Date().toISOString(),
        },
        onlyRecipientIds: resolveAssigneeNotificationRecipients(takenBy),
      });
    } catch {
      // Saved; notifications are best-effort
    }
  }

  return { success: t.medicineCabinet.createdSuccess };
}

export async function updateMedicineItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseMedicineIdFromForm(formData);
  const parsed = parseMedicineItemFromForm(formData);
  const validationError = validateMedicineFields(parsed);

  if (!id) return { error: t.medicineCabinet.errorGeneric };
  if (validationError === "name") return { error: t.medicineCabinet.errorNameRequired };
  if (validationError === "form") return { error: t.medicineCabinet.errorFormRequired };
  if (validationError === "expiry") return { error: t.medicineCabinet.errorInvalidExpiry };
  if (validationError === "availability") return { error: t.medicineCabinet.errorAvailabilityRequired };
  if (validationError) return { error: t.medicineCabinet.errorGeneric };

  const { data: existing } = await supabase
    .from("medicine_items")
    .select(
      "id, name, form_type, quantity, expiry_date, availability, location, notes, taken_by, family_id, created_by"
    )
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { error: t.medicineCabinet.errorNotOwner };

  const canEdit =
    existing.created_by === user.id || existing.taken_by === user.id;
  if (!canEdit) return { error: t.medicineCabinet.errorNotOwner };

  const formType = parsed.formType!;
  const availability = parsed.availability!;
  const name = normalizeMedicineName(parsed.name);

  const takenBy = resolveTakenByForSave(parsed.takenBy, existing.family_id, user.id);
  if (!(await validateTakenBy(supabase, takenBy, existing.family_id))) {
    return { error: t.medicineCabinet.errorInvalidTakenBy };
  }

  const { error } = await supabase
    .from("medicine_items")
    .update({
      name,
      form_type: formType,
      quantity: parsed.quantity,
      expiry_date: parsed.expiryDate,
      availability,
      location: parsed.location,
      notes: parsed.notes,
      taken_by: takenBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: t.medicineCabinet.errorGeneric };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const formLabel = t.medicineCabinet.formLabels[formType];
    const { data: members } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("family_id", familyId);
    const resolveTakenBy = (memberId: string | null) =>
      resolveTakenByLabel(
        memberId,
        profile,
        members ?? [],
        t.medicineCabinet.takenByUnassigned
      );
    const changeSummary = buildMedicineChangeSummary(
      medicineItemFromRow(existing),
      {
        name,
        form_type: formType,
        quantity: parsed.quantity,
        expiry_date: parsed.expiryDate,
        availability,
        location: parsed.location,
        notes: parsed.notes,
        taken_by: takenBy,
      },
      t.medicineCabinet,
      resolveTakenBy
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.MEDICINE_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${name}${t.notifications.notificationBodySeparator}${changeSummary}`,
        payload: {
          medicine_item_id: id,
          medicine_name: name,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
          expiry_date: parsed.expiryDate ?? null,
          updated_at: new Date().toISOString(),
        },
        onlyRecipientIds: resolveAssigneeNotificationRecipients(takenBy),
      });
    } catch {
      // Updated; notifications are best-effort
    }

    const expiryChanged = existing.expiry_date !== parsed.expiryDate;
    if (expiryChanged || isMedicineExpiringSoon(parsed.expiryDate)) {
      await maybeNotifyExpiring(supabase, {
        actorId: user.id,
        actorName,
        familyId,
        itemId: id,
        itemName: name,
        formLabel,
        expiryDate: parsed.expiryDate,
        takenBy,
      });
    }
  }

  return { success: t.medicineCabinet.updatedSuccess };
}

export async function deleteMedicineItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseMedicineIdFromForm(formData);
  if (!id) return { error: t.medicineCabinet.errorGeneric };

  const { data: existing } = await supabase
    .from("medicine_items")
    .select("id, name, form_type, family_id, created_by, taken_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.medicineCabinet.errorNotOwner };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const { error } = await supabase
    .from("medicine_items")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.medicineCabinet.errorGeneric };

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const formLabel = isValidMedicineFormType(existing.form_type)
      ? t.medicineCabinet.formLabels[existing.form_type]
      : existing.form_type;
    const bodyDetail = formatMedicineNotificationDetail(
      existing.name,
      formLabel,
      t.medicineCabinet
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.MEDICINE_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${existing.name}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          medicine_item_id: id,
          medicine_name: existing.name,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          expiry_date: null,
          updated_at: new Date().toISOString(),
        },
        onlyRecipientIds: resolveAssigneeNotificationRecipients(existing.taken_by),
      });
    } catch {
      // Deleted; notifications are best-effort
    }
  }

  return { success: t.medicineCabinet.deletedSuccess };
}
