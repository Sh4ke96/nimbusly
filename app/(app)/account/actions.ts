"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { getPasswordResetCallbackUrl } from "@/lib/supabase/auth-redirect";
import { isAuthRateLimitError } from "@/lib/supabase/auth-errors";
import { isAvatarColor } from "@/lib/avatar-colors";
import { headers } from "next/headers";
import type { AccountMode } from "@/lib/profile";

export type AccountActionState = { error: string } | { success: string } | null;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

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

  if (accountMode !== "family" && accountMode !== "solo") {
    return { error: t.account.errorGeneric };
  }

  if (accountMode === "family" && !familyName) {
    return { error: t.account.errorFamilyName };
  }

  let familyId: string | null = null;

  if (accountMode === "family") {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("family_id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile?.family_id) {
      familyId = existingProfile.family_id;
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
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      account_mode: accountMode,
      family_id: familyId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: t.account.errorGeneric };

  return {
    success:
      accountMode === "family"
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

export async function requestPasswordReset(
  _prev: AccountActionState,
  _formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user?.email) {
    return { error: t.account.errorUnauthorized };
  }

  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: getPasswordResetCallbackUrl(origin),
  });

  if (error) {
    return {
      error: isAuthRateLimitError(error.message)
        ? t.account.passwordResetRateLimit
        : t.account.passwordResetError,
    };
  }

  return { success: t.account.passwordResetSent };
}
