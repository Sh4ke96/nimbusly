"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { ACCOUNT_MODE, FAMILY_ROLE, type FamilyRole } from "@/lib/constants/account";
import { FAMILY_ACCESS_ERROR } from "@/lib/constants/server-error";
import { isFamilyAdmin } from "@/lib/profile/family-roles";
import { parseFamilyMemberRoleFromForm } from "@/lib/family/form";
import type { AccountActionState } from "@/app/(app)/account/actions";

async function requireFamilyAdmin() {
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

  if (!profile?.family_id || profile.account_mode !== ACCOUNT_MODE.FAMILY) {
    return { error: FAMILY_ACCESS_ERROR.NO_FAMILY };
  }

  const { data: family } = await supabase
    .from("families")
    .select("id, created_by")
    .eq("id", profile.family_id)
    .maybeSingle();

  if (!family || !isFamilyAdmin(profile, family, user.id)) {
    return { error: FAMILY_ACCESS_ERROR.NOT_ADMIN };
  }

  return { supabase, user, family, profile };
}

export async function updateFamilyMemberRole(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const ctx = await requireFamilyAdmin();

  if ("error" in ctx) {
    if (ctx.error === FAMILY_ACCESS_ERROR.UNAUTHORIZED) return { error: t.account.errorUnauthorized };
    if (ctx.error === FAMILY_ACCESS_ERROR.NO_FAMILY) return { error: t.account.errorNoFamily };
    return { error: t.account.errorNotFamilyAdmin };
  }

  const { memberId, role } = parseFamilyMemberRoleFromForm(formData);

  if (!memberId || (role !== FAMILY_ROLE.ADMIN && role !== FAMILY_ROLE.MEMBER)) {
    return { error: t.account.errorGeneric };
  }

  if (memberId === ctx.user.id && role === FAMILY_ROLE.MEMBER) {
    return { error: t.account.errorCannotDemoteSelf };
  }

  const { error } = await ctx.supabase.rpc("update_family_member_role", {
    p_target_user_id: memberId,
    p_role: role,
  });

  if (error) {
    if (error.message.includes("Cannot demote family founder")) {
      return { error: t.account.errorCannotDemoteFounder };
    }
    return { error: t.account.errorGeneric };
  }

  return {
    success:
      role === FAMILY_ROLE.ADMIN
        ? t.account.permissionsPromotedSuccess
        : t.account.permissionsDemotedSuccess,
  };
}
