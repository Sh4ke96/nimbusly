import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/profile";
import { mapProfileRow } from "@/lib/supabase/row-mappers";
import type { User } from "@supabase/supabase-js";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data ? mapProfileRow(data) : null;
}

export async function getAuthProfile(): Promise<{
  user: User;
  profile: Profile | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { user, profile: null };
  }

  return { user, profile: profile ? mapProfileRow(profile) : null };
}

export async function isOnboardingComplete(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.onboarding_completed === true;
}

export async function getPostAuthRedirectPath(
  userId: string
): Promise<"/dashboard" | "/onboarding"> {
  return (await isOnboardingComplete(userId)) ? "/dashboard" : "/onboarding";
}
