"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerLang, getServerT } from "@/lib/i18n/server";
import { getDisplayName } from "@/lib/profile";
import { isValidInviteCodeFormat, normalizeInviteCode } from "@/lib/family/invite";
import { sendFamilyInviteEmail } from "@/lib/family/send-invite-email";
import type { AccountActionState } from "@/app/(app)/account/actions";

async function requireFamilyOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "unauthorized" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id, account_mode")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.family_id || profile.account_mode !== "family") {
    return { error: "no_family" as const };
  }

  const { data: family } = await supabase
    .from("families")
    .select("id, name, created_by, invite_code")
    .eq("id", profile.family_id)
    .maybeSingle();

  if (!family || family.created_by !== user.id) {
    return { error: "not_owner" as const };
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
    if (ctx.error === "unauthorized") return { error: t.account.errorUnauthorized };
    if (ctx.error === "no_family") return { error: t.account.errorNoFamily };
    return { error: t.account.errorNotFamilyOwner };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();

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
      .update({ status: "revoked" })
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
    if (ctx.error === "unauthorized") return { error: t.account.errorUnauthorized };
    return { error: t.account.errorNotFamilyOwner };
  }

  const invitationId = formData.get("invitationId") as string;
  if (!invitationId) return { error: t.account.errorGeneric };

  const { error } = await ctx.supabase
    .from("family_invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("family_id", ctx.family.id)
    .eq("status", "pending");

  if (error) return { error: t.account.errorGeneric };

  return { success: t.account.familyInviteRevoked };
}

export async function validateInviteCode(code: string): Promise<
  | { ok: true; familyName: string }
  | { ok: false; error: string }
> {
  const t = await getServerT();

  if (!isValidInviteCodeFormat(code)) {
    return { ok: false, error: t.onboarding.errorInviteCodeInvalid };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lookup_family_by_invite_code", {
    p_code: normalizeInviteCode(code),
  });

  if (error || !data?.length) {
    return { ok: false, error: t.onboarding.errorInviteCodeNotFound };
  }

  return { ok: true, familyName: data[0].name as string };
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

  if (!profile?.family_id || profile.account_mode !== "family") return null;

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

  const inviteCode = (formData.get("inviteCode") as string)?.trim();

  if (!inviteCode || !isValidInviteCodeFormat(inviteCode)) {
    return { error: t.onboarding.errorInviteCodeInvalid };
  }

  const { data, error } = await supabase.rpc("lookup_family_by_invite_code", {
    p_code: normalizeInviteCode(inviteCode),
  });

  if (error || !data?.length) {
    return { error: t.onboarding.errorInviteCodeNotFound };
  }

  const familyId = data[0].id as string;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      account_mode: "family",
      family_id: familyId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: t.account.errorGeneric };
  }

  return { success: t.account.joinFamilySuccess };
}
