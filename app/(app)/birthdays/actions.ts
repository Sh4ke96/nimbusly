"use server";

import { getServerT } from "@/lib/i18n/server";
import { buildBirthdayChangeSummary } from "@/lib/birthdays/changes";
import { isValidBirthDate } from "@/lib/birthdays/types";
import { formatBirthdayLabel } from "@/lib/birthdays/types";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser } from "@/lib/server-actions/require-user";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";

export async function createBirthday(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const personName = (formData.get("personName") as string)?.trim();
  const birthMonth = Number(formData.get("birthMonth"));
  const birthDay = Number(formData.get("birthDay"));
  const description = (formData.get("description") as string)?.trim() ?? "";

  if (!personName) return { error: t.birthdays.errorPersonName };
  if (!isValidBirthDate(birthMonth, birthDay)) {
    return { error: t.birthdays.errorInvalidDate };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id ? profile.family_id : null;

  const { data: birthday, error } = await supabase
    .from("birthday_entries")
    .insert({
      family_id: familyId,
      person_name: personName,
      birth_month: birthMonth,
      birth_day: birthDay,
      birth_year: null,
      description,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !birthday) return { error: t.birthdays.errorGeneric };

  if (familyId) {
    const actorName = profile ? getDisplayName(profile) : user.email ?? "Nimbusly";
    const dateLabel = formatBirthdayLabel({
      birth_month: birthMonth,
      birth_day: birthDay,
    } as Parameters<typeof formatBirthdayLabel>[0]);

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.BIRTHDAY_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${personName}${t.notifications.notificationBodySeparator}${dateLabel}`,
        payload: {
          birthday_id: birthday.id,
          person_name: personName,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Birthday saved; notifications are best-effort
    }
  }

  return { success: t.birthdays.createdSuccess };
}

export async function updateBirthday(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  const personName = (formData.get("personName") as string)?.trim();
  const birthMonth = Number(formData.get("birthMonth"));
  const birthDay = Number(formData.get("birthDay"));
  const description = (formData.get("description") as string)?.trim() ?? "";

  if (!id) return { error: t.birthdays.errorGeneric };
  if (!personName) return { error: t.birthdays.errorPersonName };
  if (!isValidBirthDate(birthMonth, birthDay)) {
    return { error: t.birthdays.errorInvalidDate };
  }

  const { data: existing } = await supabase
    .from("birthday_entries")
    .select("id, person_name, birth_month, birth_day, description, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.birthdays.errorNotOwner };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("birthday_entries")
    .update({
      person_name: personName,
      birth_month: birthMonth,
      birth_day: birthDay,
      birth_year: null,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.birthdays.errorGeneric };

  const changeSummary = buildBirthdayChangeSummary(
    existing,
    {
      person_name: personName,
      birth_month: birthMonth,
      birth_day: birthDay,
      description,
    },
    t.birthdays
  );

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.BIRTHDAY_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${personName}${t.notifications.notificationBodySeparator}${changeSummary}`,
        payload: {
          birthday_id: id,
          person_name: personName,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Update saved; notifications are best-effort
    }
  }

  return { success: t.birthdays.updatedSuccess };
}

export async function deleteBirthday(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = formData.get("id") as string;
  if (!id) return { error: t.birthdays.errorGeneric };

  const { data: existing } = await supabase
    .from("birthday_entries")
    .select("id, person_name, birth_month, birth_day, description, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.birthdays.errorNotOwner };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_mode, family_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("birthday_entries")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.birthdays.errorGeneric };

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const dateLabel = formatBirthdayLabel({
      birth_month: existing.birth_month,
      birth_day: existing.birth_day,
    } as Parameters<typeof formatBirthdayLabel>[0]);

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.BIRTHDAY_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${existing.person_name}${t.notifications.notificationBodySeparator}${dateLabel}`,
        payload: {
          birthday_id: id,
          person_name: existing.person_name,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Entry deleted; notifications are best-effort
    }
  }

  return { success: t.birthdays.deletedSuccess };
}
