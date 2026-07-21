"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { INVITATION_STATUS } from "@/lib/constants/family-invitation";
import { FAMILY_ACCESS_ERROR } from "@/lib/constants/server-error";
import { getDisplayName } from "@/lib/profile";
import { isValidInviteCodeFormat, normalizeInviteCode } from "@/lib/family/invite";
import {
  parseFamilyInvitationIdFromForm,
  parseFamilyInviteCodeFromForm,
  parseFamilyInviteEmailFromForm,
} from "@/lib/family/form";
import { sendFamilyInviteEmail } from "@/lib/family/send-invite-email";
import { executeValidateInviteCode } from "@/lib/family/server/validate-invite-code";
import type { AccountActionState } from "@/app/(app)/account/actions";

async function requireFamilyOwner() {
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
    .select("id, name, created_by, invite_code")
    .eq("id", profile.family_id)
    .maybeSingle();

  if (!family || family.created_by !== user.id) {
    return { error: FAMILY_ACCESS_ERROR.NOT_OWNER };
  }

  return { supabase, user, family };
}

export async function sendFamilyInvitation(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const lang = await getServerLang();
  const ctx = await requireFamilyOwner();

  if ("error" in ctx) {
    if (ctx.error === FAMILY_ACCESS_ERROR.UNAUTHORIZED) return { error: t.account.errorUnauthorized };
    if (ctx.error === FAMILY_ACCESS_ERROR.NO_FAMILY) return { error: t.account.errorNoFamily };
    return { error: t.account.errorNotFamilyOwner };
  }

  const { email } = parseFamilyInviteEmailFromForm(formData);

  if (!email || !email.includes("@")) {
    return { error: t.account.familyInviteEmailInvalid };
  }

  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", ctx.user.id)
    .maybeSingle();

  const inviterName = profile ? getDisplayName(profile) : ctx.user.email ?? "Nimbusly";

  const { data: invitation, error: insertError } = await ctx.supabase
    .from("family_invitations")
    .insert({
      family_id: ctx.family.id,
      email,
      invited_by: ctx.user.id,
    })
    .select("token")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: t.account.familyInviteAlreadyPending };
    }
    return { error: t.account.familyInviteError };
  }

  try {
    const { sent } = await sendFamilyInviteEmail({
      to: email,
      familyName: ctx.family.name,
      inviteToken: invitation.token,
      inviterName,
      lang,
    });

    return {
      success: sent ? t.account.familyInviteEmailSent : t.account.familyInviteCreatedNoEmail,
    };
  } catch {
    await ctx.supabase
      .from("family_invitations")
      .update({ status: INVITATION_STATUS.REVOKED })
      .eq("token", invitation.token);

    return { error: t.account.familyInviteError };
  }
}

export async function revokeFamilyInvitation(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const ctx = await requireFamilyOwner();

  if ("error" in ctx) {
    if (ctx.error === FAMILY_ACCESS_ERROR.UNAUTHORIZED) return { error: t.account.errorUnauthorized };
    return { error: t.account.errorNotFamilyOwner };
  }

  const invitationId = parseFamilyInvitationIdFromForm(formData);
  if (!invitationId) return { error: t.account.errorGeneric };

  const { error } = await ctx.supabase
    .from("family_invitations")
    .update({ status: INVITATION_STATUS.REVOKED })
    .eq("id", invitationId)
    .eq("family_id", ctx.family.id)
    .eq("status", INVITATION_STATUS.PENDING);

  if (error) return { error: t.account.errorGeneric };

  return { success: t.account.familyInviteRevoked };
}

export async function validateInviteCode(code: string): Promise<
  | { ok: true; familyName: string }
  | { ok: false; error: string }
> {
  const t = await getServerT();
  const supabase = await createClient();
  return executeValidateInviteCode({ t, supabase }, code);
}

/** Ensures the current user's family has an invite code (owner only). */
export async function ensureFamilyInviteCode(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id, account_mode")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.family_id || profile.account_mode !== ACCOUNT_MODE.FAMILY) return null;

  const { data, error } = await supabase.rpc("ensure_family_invite_code", {
    p_family_id: profile.family_id,
  });

  if (error || !data) return null;
  return data as string;
}

export async function joinFamilyWithInviteCode(
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id, account_mode")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.family_id) {
    return { error: t.account.errorAlreadyInFamily };
  }

  const { inviteCode } = parseFamilyInviteCodeFromForm(formData);

  if (!inviteCode || !isValidInviteCodeFormat(inviteCode)) {
    return { error: t.onboarding.errorInviteCodeInvalid };
  }

  const { data: familyId, error: joinError } = await supabase.rpc("join_family_with_invite_code", {
    p_code: normalizeInviteCode(inviteCode),
  });

  if (joinError || !familyId) {
    return { error: t.onboarding.errorInviteCodeNotFound };
  }

  return { success: t.account.joinFamilySuccess };
}
