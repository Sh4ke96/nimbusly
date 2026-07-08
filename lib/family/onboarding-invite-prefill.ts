import { cookies } from "next/headers";
import { FAMILY_SETUP_INTENT, type FamilySetupIntent } from "@/lib/constants/account";
import { INVITE_CODE_COOKIE, INVITE_TOKEN_COOKIE } from "@/lib/family/constants";
import { formatInviteCode } from "@/lib/family/invite";

export type OnboardingInvitePrefill = {
  inviteCode: string;
  inviteToken: string;
};

export async function readOnboardingInvitePrefill(): Promise<OnboardingInvitePrefill> {
  const cookieStore = await cookies();
  const rawCode = cookieStore.get(INVITE_CODE_COOKIE)?.value ?? "";
  const inviteToken = cookieStore.get(INVITE_TOKEN_COOKIE)?.value?.trim() ?? "";
  const inviteCode = rawCode ? formatInviteCode(rawCode) : "";

  return { inviteCode, inviteToken };
}

export function resolveOnboardingFamilyIntent(
  inviteCode: string,
  inviteToken: string
): FamilySetupIntent {
  if (inviteToken.trim() || inviteCode.trim()) {
    return FAMILY_SETUP_INTENT.JOIN;
  }
  return FAMILY_SETUP_INTENT.CREATE;
}

export function hasInviteCodeFromRegistration(
  inviteCode: string,
  inviteToken: string
): boolean {
  return inviteCode.trim().length > 0 && inviteToken.trim().length === 0;
}
