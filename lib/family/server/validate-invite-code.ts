import { isValidInviteCodeFormat, normalizeInviteCode } from "@/lib/family/invite";
import type { Dict } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

export type ValidateInviteCodeResult =
  | { ok: true; familyName: string }
  | { ok: false; error: string };

export async function executeValidateInviteCode(
  { t, supabase }: { t: Dict; supabase: AppSupabase },
  code: string
): Promise<ValidateInviteCodeResult> {
  if (!isValidInviteCodeFormat(code)) {
    return { ok: false, error: t.onboarding.errorInviteCodeInvalid };
  }

  const { data, error } = await supabase.rpc("lookup_family_by_invite_code", {
    p_code: normalizeInviteCode(code),
  });

  if (error || !data?.length) {
    return { ok: false, error: t.onboarding.errorInviteCodeNotFound };
  }

  return { ok: true, familyName: data[0].name };
}
