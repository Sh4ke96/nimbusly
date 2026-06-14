"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { isAvatarColor } from "@/lib/avatar-colors";
import type { AccountMode } from "@/lib/profile";

export type OnboardingState = { error: string } | null;

export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const t = await getServerT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, family_id, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const avatarColor = formData.get("avatarColor") as string;
  const accountMode = formData.get("accountMode") as AccountMode;
  const familyName = (formData.get("familyName") as string)?.trim();

  if (!firstName) {
    return { error: t.onboarding.errorFirstName };
  }

  if (!lastName) {
    return { error: t.onboarding.errorLastName };
  }

  if (!isAvatarColor(avatarColor)) {
    return { error: t.onboarding.errorGeneric };
  }

  if (accountMode !== "family" && accountMode !== "solo") {
    return { error: t.onboarding.errorGeneric };
  }

  if (accountMode === "family" && !familyName) {
    return { error: t.onboarding.errorFamilyName };
  }

  let familyId: string | null = existingProfile?.family_id ?? null;

  if (accountMode === "family") {
    if (familyId) {
      const { error: familyError } = await supabase
        .from("families")
        .update({ name: familyName })
        .eq("id", familyId)
        .eq("created_by", user.id);

      if (familyError) {
        return { error: t.onboarding.errorGeneric };
      }
    } else {
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({ name: familyName, created_by: user.id })
        .select("id")
        .single();

      if (familyError || !family) {
        return { error: t.onboarding.errorGeneric };
      }

      familyId = family.id;
    }
  } else {
    familyId = null;
  }

  const profilePayload = {
    first_name: firstName,
    last_name: lastName,
    avatar_color: avatarColor,
    family_id: familyId,
    account_mode: accountMode,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };

  const profileError = existingProfile
    ? (
        await supabase
          .from("profiles")
          .update(profilePayload)
          .eq("id", user.id)
      ).error
    : (
        await supabase.from("profiles").insert({
          id: user.id,
          ...profilePayload,
        })
      ).error;

  if (profileError) {
    return { error: t.onboarding.errorGeneric };
  }

  redirect("/dashboard");
}
