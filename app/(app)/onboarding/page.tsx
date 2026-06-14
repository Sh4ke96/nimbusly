import { redirect } from "next/navigation";
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

  return <OnboardingView />;
}
