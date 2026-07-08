import { redirect } from "next/navigation";
import { readOnboardingInvitePrefill } from "@/lib/family/server/read-onboarding-invite-prefill";
import { getAuthProfile } from "@/lib/profile/server";
import { OnboardingView } from "./onboarding-view";

export default async function OnboardingPage() {
  const auth = await getAuthProfile();

  if (!auth) {
    redirect("/login");
  }

  if (auth.profile?.onboarding_completed === true) {
    redirect("/dashboard");
  }

  const invitePrefill = await readOnboardingInvitePrefill();

  return <OnboardingView invitePrefill={invitePrefill} />;
}
