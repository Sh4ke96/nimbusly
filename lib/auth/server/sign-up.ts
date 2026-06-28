import { parseSignUpFromForm } from "@/lib/auth/form";
import { isValidInviteCodeFormat, normalizeInviteCode } from "@/lib/family/invite";
import { DEV_SITE_URL } from "@/lib/constants/dev";
import type { Dict } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

export type SignUpResult =
  | { ok: false; error: string }
  | { ok: true; success: string; inviteCode: string | null };

export type SignUpContext = {
  t: Dict;
  supabase: AppSupabase;
  siteUrl?: string;
};

export async function executeSignUp(
  { t, supabase, siteUrl = DEV_SITE_URL }: SignUpContext,
  formData: FormData
): Promise<SignUpResult> {
  const { email, password, confirmPassword, inviteCode } = parseSignUpFromForm(formData);

  if (!email || !password) {
    return { ok: false, error: t.register.errorRequired };
  }

  if (inviteCode && !isValidInviteCodeFormat(inviteCode)) {
    return { ok: false, error: t.register.errorInviteCodeInvalid };
  }

  if (password.length < 8) {
    return { ok: false, error: t.register.errorPasswordLength };
  }

  if (password !== confirmPassword) {
    return { ok: false, error: t.register.errorPasswordMatch };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/api/auth/callback`,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("already registered") ||
      message.includes("already been registered") ||
      error.code === "user_already_exists"
    ) {
      return { ok: false, error: t.register.errorEmailTaken };
    }
    if (
      message.includes("rate limit") ||
      error.code === "over_email_send_rate_limit"
    ) {
      return { ok: false, error: t.register.errorEmailRateLimit };
    }
    return { ok: false, error: t.register.errorGeneric };
  }

  return {
    ok: true,
    success: t.register.successMessage,
    inviteCode: inviteCode ? normalizeInviteCode(inviteCode) : null,
  };
}
