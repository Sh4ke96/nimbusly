"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ONBOARDING_COMPLETE_COOKIE,
  ONBOARDING_COMPLETE_COOKIE_VALUE,
} from "@/lib/constants/session-cookies";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { isAvatarColor } from "@/lib/avatar-colors";
import { INVITE_TOKEN_COOKIE, INVITE_CODE_COOKIE } from "@/lib/family/constants";
import { isValidInviteCodeFormat, normalizeInviteCode } from "@/lib/family/invite";
import { parseOnboardingFromForm } from "@/lib/profile/form";
import { FAMILY_SETUP_INTENT } from "@/lib/constants/account";

export type OnboardingState = { error: string } | null;

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
    .select("id, family_id, family_role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const {
    firstName,
    lastName,
    avatarColor,
    familyIntent,
    familyName,
    inviteCode,
    inviteToken,
  } = parseOnboardingFromForm(formData);

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

  let profileError: { message: string } | null = null;

  if (familyIntent === FAMILY_SETUP_INTENT.SOLO) {
    profileError = (
      await supabase.rpc("complete_solo_onboarding", {
        p_first_name: firstName,
        p_last_name: lastName,
        p_avatar_color: avatarColor,
      })
    ).error;
  } else if (familyIntent === FAMILY_SETUP_INTENT.CREATE) {
    if (!familyName) {
      return { error: t.onboarding.errorFamilyName };
    }

    let familyId = existingProfile?.family_id ?? null;

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
      const { data: createdFamilyId, error: familyError } = await supabase.rpc(
        "create_family_and_join",
        { p_family_name: familyName }
      );

      if (familyError || !createdFamilyId) {
        return { error: t.onboarding.errorGeneric };
      }

      familyId = createdFamilyId as string;
    }

    profileError = (
      await supabase.rpc("complete_founder_onboarding", {
        p_first_name: firstName,
        p_last_name: lastName,
        p_avatar_color: avatarColor,
        p_family_id: familyId,
      })
    ).error;
  } else if (familyIntent === FAMILY_SETUP_INTENT.JOIN) {
    const cookieStore = await cookies();
    const tokenFromCookie = cookieStore.get(INVITE_TOKEN_COOKIE)?.value ?? "";
    const codeFromCookie = cookieStore.get(INVITE_CODE_COOKIE)?.value ?? "";
    const token = inviteToken || tokenFromCookie;
    const code = inviteCode || codeFromCookie;

    if (token) {
      profileError = (
        await supabase.rpc("onboard_with_invitation_token", {
          p_token: token,
          p_first_name: firstName,
          p_last_name: lastName,
          p_avatar_color: avatarColor,
        })
      ).error;
    } else {
      if (!code || !isValidInviteCodeFormat(code)) {
        return { error: t.onboarding.errorInviteCodeInvalid };
      }

      profileError = (
        await supabase.rpc("onboard_with_invite_code", {
          p_code: normalizeInviteCode(code),
          p_first_name: firstName,
          p_last_name: lastName,
          p_avatar_color: avatarColor,
        })
      ).error;
    }
  } else {
    profileError = (
      await supabase.rpc("complete_solo_onboarding", {
        p_first_name: firstName,
        p_last_name: lastName,
        p_avatar_color: avatarColor,
      })
    ).error;
  }

  if (profileError) {
    return { error: t.onboarding.errorGeneric };
  }

  const cookieStore = await cookies();
  cookieStore.set(ONBOARDING_COMPLETE_COOKIE, ONBOARDING_COMPLETE_COOKIE_VALUE, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (familyIntent === FAMILY_SETUP_INTENT.JOIN) {
    cookieStore.delete(INVITE_TOKEN_COOKIE);
    cookieStore.delete(INVITE_CODE_COOKIE);
  }

  redirect("/dashboard");
}
