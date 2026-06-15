"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { ACCOUNT_MODE, FAMILY_ROLE, type FamilyRole } from "@/lib/constants/account";
import { FAMILY_ACCESS_ERROR } from "@/lib/constants/server-error";
import { familyInsertPayload } from "@/lib/supabase/row-mappers";
import { isFamilyAdmin } from "@/lib/profile/family-roles";
import { parseFamilyMemberIdFromForm, parseFamilyMemberRoleFromForm } from "@/lib/family/form";
import { mapFamilyRpcError } from "@/lib/family/rpc-errors";
import { PROFILE_FORM_FIELD } from "@/lib/profile/form";
import { getFormTrimmedString } from "@/lib/form/values";
import type { AccountActionState } from "@/app/(app)/account/actions";

async function requireFamilyMember() {
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

  if (!family) return { error: FAMILY_ACCESS_ERROR.NO_FAMILY };

  return { supabase, user, family, profile };
}

export async function createFamily(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: t.account.errorUnauthorized };
  }

  const familyName = getFormTrimmedString(formData, PROFILE_FORM_FIELD.FAMILY_NAME);

  if (!familyName) {
    return { error: t.account.errorFamilyName };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id, account_mode")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.family_id) {
    return { error: t.account.errorAlreadyInFamily };
  }

  if (profile?.account_mode !== ACCOUNT_MODE.SOLO) {
    return { error: t.account.errorGeneric };
  }

  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert(familyInsertPayload({ name: familyName, created_by: user.id }))
    .select("id")
    .single();

  if (familyError || !family) {
    return { error: t.account.errorGeneric };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      account_mode: ACCOUNT_MODE.FAMILY,
      family_id: family.id,
      family_role: FAMILY_ROLE.ADMIN,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: t.account.errorGeneric };

  return { success: t.account.createFamilySuccess };
}

export async function leaveFamily(
  _prev: AccountActionState,
  _formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const ctx = await requireFamilyMember();

  if ("error" in ctx) {
    if (ctx.error === FAMILY_ACCESS_ERROR.UNAUTHORIZED) return { error: t.account.errorUnauthorized };
    return { error: t.account.errorNoFamily };
  }

  const { error } = await ctx.supabase.rpc("leave_family");

  if (error) {
    return { error: mapFamilyRpcError(error.message, t.account) };
  }

  return { success: t.account.leaveFamilySuccess };
}

export async function removeFamilyMember(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const ctx = await requireFamilyMember();

  if ("error" in ctx) {
    if (ctx.error === FAMILY_ACCESS_ERROR.UNAUTHORIZED) return { error: t.account.errorUnauthorized };
    return { error: t.account.errorNoFamily };
  }

  if (
    !isFamilyAdmin(
      { family_role: ctx.profile.family_role as FamilyRole | null },
      ctx.family,
      ctx.user.id
    )
  ) {
    return { error: t.account.errorNotFamilyAdmin };
  }

  const { memberId } = parseFamilyMemberIdFromForm(formData);

  if (!memberId) {
    return { error: t.account.errorGeneric };
  }

  const { error } = await ctx.supabase.rpc("remove_family_member", {
    p_target_user_id: memberId,
  });

  if (error) {
    return { error: mapFamilyRpcError(error.message, t.account) };
  }

  return { success: t.account.removeMemberSuccess };
}

export async function transferFamilyOwnership(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const ctx = await requireFamilyMember();

  if ("error" in ctx) {
    if (ctx.error === FAMILY_ACCESS_ERROR.UNAUTHORIZED) return { error: t.account.errorUnauthorized };
    return { error: t.account.errorNoFamily };
  }

  if (ctx.family.created_by !== ctx.user.id) {
    return { error: t.account.errorNotFamilyOwner };
  }

  const { memberId } = parseFamilyMemberIdFromForm(formData);

  if (!memberId) {
    return { error: t.account.errorGeneric };
  }

  const { error } = await ctx.supabase.rpc("transfer_family_ownership", {
    p_new_founder_id: memberId,
  });

  if (error) {
    return { error: mapFamilyRpcError(error.message, t.account) };
  }

  return { success: t.account.transferFounderSuccess };
}

export async function updateFamilyMemberRole(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const ctx = await requireFamilyMember();

  if ("error" in ctx) {
    if (ctx.error === FAMILY_ACCESS_ERROR.UNAUTHORIZED) return { error: t.account.errorUnauthorized };
    return { error: t.account.errorNoFamily };
  }

  if (
    !isFamilyAdmin(
      { family_role: ctx.profile.family_role as FamilyRole | null },
      ctx.family,
      ctx.user.id
    )
  ) {
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
    return { error: mapFamilyRpcError(error.message, t.account) };
  }

  return {
    success:
      role === FAMILY_ROLE.ADMIN
        ? t.account.permissionsPromotedSuccess
        : t.account.permissionsDemotedSuccess,
  };
}
