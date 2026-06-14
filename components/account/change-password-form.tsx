"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getPasswordResetCallbackUrl } from "@/lib/supabase/auth-redirect";
import { isAuthRateLimitError } from "@/lib/supabase/auth-errors";
import { useT } from "@/lib/lang-context";

export function ChangePasswordForm() {
  const t = useT();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setError(t.account.errorUnauthorized);
      setPending(false);
      return;
    }

    const redirectTo = getPasswordResetCallbackUrl(window.location.origin);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      user.email,
      { redirectTo }
    );

    setPending(false);

    if (resetError) {
      setError(
        isAuthRateLimitError(resetError.message)
          ? t.account.passwordResetRateLimit
          : t.account.passwordResetError
      );
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="size-6 text-primary mx-auto" />
        <p className="text-sm font-medium text-foreground">
          {t.account.changePasswordSuccessTitle}
        </p>
        <p className="text-xs text-muted-foreground">
          {t.account.changePasswordSuccessMessage}
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard">{t.account.changePasswordBack}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.account.changePasswordDesc}</p>

      {error && (
        <p className="text-sm text-destructive rounded-none bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.account.changePasswordSubmitting : t.account.changePasswordBtn}
      </Button>
    </form>
  );
}
