import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveSafeRedirectPath } from "@/lib/auth/safe-redirect-path";
import { getPostAuthRedirectPath } from "@/lib/profile/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fallback = user ? await getPostAuthRedirectPath(user.id) : "/onboarding";
      const destination = resolveSafeRedirectPath(nextParam, fallback);

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
