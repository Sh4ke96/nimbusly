import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_MODE, type FamilyRole } from "@/lib/constants/account";
import { FAMILY_ACCESS_ERROR, type FamilyAccessError } from "@/lib/constants/server-error";
import { isFamilyAdmin } from "@/lib/profile/family-roles";

export const SHOPPING_CATEGORY_SCOPE = {
  SOLO: "solo",
  FAMILY: "family",
} as const;

export type ShoppingCategoryScope =
  (typeof SHOPPING_CATEGORY_SCOPE)[keyof typeof SHOPPING_CATEGORY_SCOPE];

type SoloContext = {
  scope: typeof SHOPPING_CATEGORY_SCOPE.SOLO;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string };
};

type FamilyContext = {
  scope: typeof SHOPPING_CATEGORY_SCOPE.FAMILY;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string };
  family: { id: string; created_by: string };
};

type ShoppingCategoryManagerResult =
  | SoloContext
  | FamilyContext
  | { error: FamilyAccessError };

export async function requireShoppingCategoryManager(): Promise<ShoppingCategoryManagerResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: FAMILY_ACCESS_ERROR.UNAUTHORIZED };

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id, account_mode, family_role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { error: FAMILY_ACCESS_ERROR.UNAUTHORIZED };

  if (profile.account_mode === ACCOUNT_MODE.SOLO && !profile.family_id) {
    return { scope: SHOPPING_CATEGORY_SCOPE.SOLO, supabase, user };
  }

  if (!profile.family_id || profile.account_mode !== ACCOUNT_MODE.FAMILY) {
    return { error: FAMILY_ACCESS_ERROR.NO_FAMILY };
  }

  const { data: family } = await supabase
    .from("families")
    .select("id, created_by")
    .eq("id", profile.family_id)
    .maybeSingle();

  if (
    !family ||
    !isFamilyAdmin(
      { family_role: profile.family_role as FamilyRole | null },
      family,
      user.id
    )
  ) {
    return { error: FAMILY_ACCESS_ERROR.NOT_FOUNDER };
  }

  return {
    scope: SHOPPING_CATEGORY_SCOPE.FAMILY,
    supabase,
    user,
    family,
  };
}
