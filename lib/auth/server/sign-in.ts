import { parseSignInFromForm } from "@/lib/auth/form";
import type { Dict } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

export type SignInResult =
  | { ok: false; error: string }
  | { ok: true; redirectTo: string };

export type SignInContext = {
  t: Dict;
  supabase: AppSupabase;
  getPostAuthRedirectPath: (userId: string) => Promise<string>;
};

export async function executeSignIn(
  { t, supabase, getPostAuthRedirectPath }: SignInContext,
  formData: FormData
): Promise<SignInResult> {
  const { email, password } = parseSignInFromForm(formData);

  if (!email || !password) {
    return { ok: false, error: t.login.errorRequired };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("invalid")) {
      return { ok: false, error: t.login.errorInvalid };
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { ok: false, error: t.login.errorNotConfirmed };
    }
    return { ok: false, error: t.login.errorGeneric };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: true, redirectTo: "/onboarding" };
  }

  return { ok: true, redirectTo: await getPostAuthRedirectPath(user.id) };
}
