import { FAMILY_SETUP_INTENT, type FamilySetupIntent } from "@/lib/constants/account";

export type OnboardingInvitePrefill = {
  inviteCode: string;
  inviteToken: string;
};

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
