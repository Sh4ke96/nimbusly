"use server";

import { getServerT } from "@/lib/i18n/server";
import { isAvatarColor } from "@/lib/avatar-colors";
import { parseFamilyRenameFromForm, parseProfileNamesFromForm } from "@/lib/profile/form";
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

  const { firstName, lastName, avatarColor } = parseProfileNamesFromForm(formData);

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

export async function updateFamilyName(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) {
    return { error: t.account.errorUnauthorized };
  }

  const { familyName } = parseFamilyRenameFromForm(formData);

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
