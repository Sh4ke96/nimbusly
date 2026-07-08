import { cookies } from "next/headers";
import { INVITE_CODE_COOKIE, INVITE_TOKEN_COOKIE } from "@/lib/family/constants";
import { formatInviteCode } from "@/lib/family/invite";
import type { OnboardingInvitePrefill } from "@/lib/family/onboarding-invite-prefill";

export async function readOnboardingInvitePrefill(): Promise<OnboardingInvitePrefill> {
  const cookieStore = await cookies();
  const rawCode = cookieStore.get(INVITE_CODE_COOKIE)?.value ?? "";
  const inviteToken = cookieStore.get(INVITE_TOKEN_COOKIE)?.value?.trim() ?? "";
  const inviteCode = rawCode ? formatInviteCode(rawCode) : "";

  return { inviteCode, inviteToken };
}
