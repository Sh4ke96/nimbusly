"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { isAvatarColor } from "@/lib/avatar-colors";
import { INVITE_TOKEN_COOKIE, INVITE_CODE_COOKIE, parseFamilySetupIntent } from "@/lib/family/constants";
import { isValidInviteCodeFormat, normalizeInviteCode } from "@/lib/family/invite";
import type { AccountMode } from "@/lib/profile";

export type OnboardingState = { error: string } | null;

async function resolveFamilyFromInviteToken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  token: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc("accept_family_invitation", {
    p_token: token,
    p_user_id: userId,
  });

  if (error || !data) return null;
  return data as string;
}

async function resolveFamilyFromInviteCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc("lookup_family_by_invite_code", {
    p_code: normalizeInviteCode(code),
  });

  if (error || !data?.length) return null;
  return data[0].id as string;
}

export async function completeOnboarding(
  _prev: OnboardingState,
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
  const familyIntent = parseFamilySetupIntent(formData.get("familyIntent"));
  const familyName = (formData.get("familyName") as string)?.trim();
  const inviteCode = (formData.get("inviteCode") as string)?.trim();
  const inviteToken = (formData.get("inviteToken") as string)?.trim();

  if (!firstName) {
    return { error: t.onboarding.errorFirstName };
  }

  if (!lastName) {
    return { error: t.onboarding.errorLastName };
  }

  if (!isAvatarColor(avatarColor)) {
    return { error: t.onboarding.errorGeneric };
  }

  if (!familyIntent) {
    return { error: t.onboarding.errorGeneric };
  }

  let accountMode: AccountMode = familyIntent === "solo" ? "solo" : "family";
  let familyId: string | null = existingProfile?.family_id ?? null;

  if (familyIntent === "create") {
    if (!familyName) {
      return { error: t.onboarding.errorFamilyName };
    }

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
  } else if (familyIntent === "join") {
    const cookieStore = await cookies();
    const tokenFromCookie = cookieStore.get(INVITE_TOKEN_COOKIE)?.value ?? "";
    const codeFromCookie = cookieStore.get(INVITE_CODE_COOKIE)?.value ?? "";
    const token = inviteToken || tokenFromCookie;
    const code = inviteCode || codeFromCookie;

    if (token) {
      const joinedFamilyId = await resolveFamilyFromInviteToken(supabase, user.id, token);
      if (!joinedFamilyId) {
        return { error: t.onboarding.errorInviteTokenInvalid };
      }
      familyId = joinedFamilyId;
    } else {
      if (!code || !isValidInviteCodeFormat(code)) {
        return { error: t.onboarding.errorInviteCodeInvalid };
      }

      const joinedFamilyId = await resolveFamilyFromInviteCode(supabase, code);
      if (!joinedFamilyId) {
        return { error: t.onboarding.errorInviteCodeNotFound };
      }
      familyId = joinedFamilyId;
    }

    accountMode = "family";
  } else {
    familyId = null;
    accountMode = "solo";
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

  if (familyIntent === "join") {
    const cookieStore = await cookies();
    cookieStore.delete(INVITE_TOKEN_COOKIE);
    cookieStore.delete(INVITE_CODE_COOKIE);
  }

  redirect("/dashboard");
}
