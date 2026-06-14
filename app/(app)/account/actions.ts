"use server";

import { getServerT } from "@/lib/i18n/server";
import { isAvatarColor } from "@/lib/avatar-colors";
import { ACCOUNT_MODE, FAMILY_ROLE, type AccountMode, type FamilyRole } from "@/lib/constants/account";
import { requireUser } from "@/lib/server-actions/require-user";

export type AccountActionState = { error: string } | { success: string } | null;

export async function updateProfile(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: t.account.errorUnauthorized };
  }

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const avatarColor = formData.get("avatarColor") as string;

  if (!firstName) return { error: t.account.errorFirstName };
  if (!lastName) return { error: t.account.errorLastName };
  if (!isAvatarColor(avatarColor)) return { error: t.account.errorGeneric };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      avatar_color: avatarColor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: t.account.errorGeneric };

  return { success: t.account.profileSaved };
}

export async function updateAccountMode(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: t.account.errorUnauthorized };
  }

  const accountMode = formData.get("accountMode") as AccountMode;
  const familyName = (formData.get("familyName") as string)?.trim();

  if (accountMode !== ACCOUNT_MODE.FAMILY && accountMode !== ACCOUNT_MODE.SOLO) {
    return { error: t.account.errorGeneric };
  }

  if (accountMode === ACCOUNT_MODE.FAMILY && !familyName) {
    return { error: t.account.errorFamilyName };
  }

  let familyId: string | null = null;
  let familyRole: FamilyRole | null = null;

  if (accountMode === ACCOUNT_MODE.FAMILY) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("family_id, family_role")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile?.family_id) {
      familyId = existingProfile.family_id;
      familyRole = existingProfile.family_role;
    } else {
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({ name: familyName, created_by: user.id })
        .select("id")
        .single();

      if (familyError || !family) {
        return { error: t.account.errorGeneric };
      }

      familyId = family.id;
      familyRole = FAMILY_ROLE.ADMIN;
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      account_mode: accountMode,
      family_id: familyId,
      family_role: accountMode === ACCOUNT_MODE.SOLO ? null : familyRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: t.account.errorGeneric };

  return {
    success:
      accountMode === ACCOUNT_MODE.FAMILY
        ? t.account.accountModeFamilySaved
        : t.account.accountModeSoloSaved,
  };
}

export async function updateFamilyName(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: t.account.errorUnauthorized };
  }

  const familyName = (formData.get("familyName") as string)?.trim();

  if (!familyName) {
    return { error: t.account.errorFamilyName };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.family_id) {
    return { error: t.account.errorNoFamily };
  }

  const { error } = await supabase
    .from("families")
    .update({ name: familyName })
    .eq("id", profile.family_id)
    .eq("created_by", user.id);

  if (error) return { error: t.account.errorGeneric };

  return { success: t.account.familySaved };
}
