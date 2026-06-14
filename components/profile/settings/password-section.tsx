"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SettingsFormFooter } from "@/components/profile/settings/settings-form-footer";
import { createClient } from "@/lib/supabase/client";
import { getPasswordResetCallbackUrl } from "@/lib/supabase/auth-redirect";
import { isAuthRateLimitError } from "@/lib/supabase/auth-errors";
import { useT } from "@/lib/lang-context";
import { toast } from "sonner";

export function PasswordSection() {
  const t = useT();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      toast.error(t.account.errorUnauthorized);
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
      toast.error(
        isAuthRateLimitError(resetError.message)
          ? t.account.passwordResetRateLimit
          : t.account.passwordResetError
      );
      return;
    }

    toast.success(t.account.changePasswordSuccessTitle, {
      description: t.account.changePasswordSuccessMessage,
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 max-w-lg">
        <p className="text-sm text-muted-foreground">{t.account.changePasswordSuccessMessage}</p>
        <Button type="button" variant="outline" onClick={() => setSent(false)}>
          {t.account.changePasswordBtn}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <p className="text-sm text-muted-foreground">{t.account.changePasswordDesc}</p>

      <SettingsFormFooter
        pending={pending}
        savingLabel={t.account.changePasswordSubmitting}
        saveLabel={t.account.changePasswordBtn}
      />
    </form>
  );
}
