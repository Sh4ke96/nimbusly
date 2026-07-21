"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import type { Profile } from "@/lib/profile";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function requireAuthenticatedUser() {
  const { supabase, user } = await requireUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}

type ProfileFamilyFields = Pick<
  Profile,
  "id" | "account_mode" | "family_id" | "first_name" | "last_name"
>;

export async function getProfileFamilyContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, account_mode, family_id, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  const typedProfile = profile as ProfileFamilyFields | null;
  const familyId =
    typedProfile?.account_mode === ACCOUNT_MODE.FAMILY && typedProfile.family_id
      ? typedProfile.family_id
      : null;

  return { profile: typedProfile, familyId };
}
