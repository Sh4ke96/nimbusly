"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import { buildBirthdayChangeSummary } from "@/lib/birthdays/changes";
import { isValidBirthDate } from "@/lib/birthdays/types";
import { formatBirthdayLabel } from "@/lib/birthdays/types";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function notifyFamilyAboutBirthdayEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    type: "birthday_added" | "birthday_updated";
    actorId: string;
    actorName: string;
    familyId: string;
    birthdayId: string;
    personName: string;
    bodyDetail: string;
    changeSummary?: string;
  }
) {
  const lang = await getServerLang();
  const { data: members } = await supabase
    .from("profiles")
    .select("id")
    .eq("family_id", params.familyId);

  const recipientIds = (members ?? [])
    .map((m) => m.id as string)
    .filter((id) => id !== params.actorId);

  if (recipientIds.length === 0) return;

  const title =
    params.type === "birthday_added"
      ? lang === "pl"
        ? `${params.actorName} dodał urodziny`
        : `${params.actorName} added a birthday`
      : lang === "pl"
        ? `${params.actorName} zaktualizował urodziny`
        : `${params.actorName} updated a birthday`;

  const body = `${params.personName} — ${params.bodyDetail}`;

  await supabase.rpc("create_family_notifications", {
    p_recipient_ids: recipientIds,
    p_type: params.type,
    p_title: title,
    p_body: body,
    p_payload: {
      birthday_id: params.birthdayId,
      person_name: params.personName,
      actor_id: params.actorId,
      family_id: params.familyId,
      change_summary: params.changeSummary ?? null,
      updated_at: new Date().toISOString(),
    },
  });
}

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
    profile?.account_mode === "family" && profile.family_id ? profile.family_id : null;

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
      await notifyFamilyAboutBirthdayEvent(supabase, {
        type: "birthday_added",
        actorId: user.id,
        actorName,
        familyId,
        birthdayId: birthday.id,
        personName,
        bodyDetail: dateLabel,
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
  const lang = await getServerLang();
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

  const changeSummary = buildBirthdayChangeSummary(existing, {
    person_name: personName,
    birth_month: birthMonth,
    birth_day: birthDay,
    description,
  }, lang);

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === "family") {
    const actorName = getDisplayName(profile);
    try {
      await notifyFamilyAboutBirthdayEvent(supabase, {
        type: "birthday_updated",
        actorId: user.id,
        actorName,
        familyId,
        birthdayId: id,
        personName,
        bodyDetail: changeSummary,
        changeSummary,
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

  const { error } = await supabase
    .from("birthday_entries")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.birthdays.errorGeneric };

  return { success: t.birthdays.deletedSuccess };
}
