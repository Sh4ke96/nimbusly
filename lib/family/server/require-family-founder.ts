import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { FAMILY_ACCESS_ERROR, type FamilyAccessError } from "@/lib/constants/server-error";
import { isFamilyFounder } from "@/lib/profile/family-roles";

type FamilyFounderContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string };
  family: { id: string; created_by: string };
  profile: { family_id: string | null; account_mode: string };
};

type FamilyFounderResult =
  | FamilyFounderContext
  | { error: FamilyAccessError };

export async function requireFamilyFounder(): Promise<FamilyFounderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: FAMILY_ACCESS_ERROR.UNAUTHORIZED };

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id, account_mode")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.family_id || profile.account_mode !== ACCOUNT_MODE.FAMILY) {
    return { error: FAMILY_ACCESS_ERROR.NO_FAMILY };
  }

  const { data: family } = await supabase
    .from("families")
    .select("id, created_by")
    .eq("id", profile.family_id)
    .maybeSingle();

  if (!family || !isFamilyFounder(family, user.id)) {
    return { error: FAMILY_ACCESS_ERROR.NOT_FOUNDER };
  }

  return { supabase, user, family, profile };
}
