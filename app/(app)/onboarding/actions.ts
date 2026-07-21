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
import { parseOnboardingFromForm } from "@/lib/profile/form";
import { FAMILY_SETUP_INTENT } from "@/lib/constants/account";
import { resolveOnboardingRpc } from "@/lib/onboarding/resolve-onboarding-rpc";

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

  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get(INVITE_TOKEN_COOKIE)?.value ?? "";
  const codeFromCookie = cookieStore.get(INVITE_CODE_COOKIE)?.value ?? "";
  const token = inviteToken || tokenFromCookie;
  const code = inviteCode || codeFromCookie;

  const rpcPlan = resolveOnboardingRpc({
    familyIntent,
    firstName,
    lastName,
    avatarColor,
    familyName,
    inviteToken: token,
    inviteCode: code,
  });

  if (!rpcPlan.ok) {
    if (rpcPlan.error === "missing_family_name") {
      return { error: t.onboarding.errorFamilyName };
    }

    return { error: t.onboarding.errorInviteCodeInvalid };
  }

  const profileError = (await supabase.rpc(rpcPlan.call.rpc, rpcPlan.call.args)).error;

  if (profileError) {
    return { error: t.onboarding.errorGeneric };
  }

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
