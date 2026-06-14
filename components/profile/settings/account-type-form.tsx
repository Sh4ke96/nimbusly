"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import type { AccountMode } from "@/lib/profile";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateAccountMode } from "@/app/(app)/account/actions";
import { Heart, User } from "lucide-react";

export function AccountTypeForm() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const [accountMode, setAccountMode] = useState<AccountMode>(
    profile?.account_mode ?? "solo"
  );
  const [state, action, pending] = useActionState(updateAccountMode, null);

  useEffect(() => {
    if (profile?.account_mode) setAccountMode(profile.account_mode);
  }, [profile?.account_mode]);

  useActionFeedback(state, () => void refreshProfile());

  if (!profile) {
    return (
      <div className="space-y-6 max-w-lg">
        <Skeleton className="h-4 w-full max-w-sm rounded-none" />
        <Skeleton className="h-20 w-full rounded-none" />
        <Skeleton className="h-20 w-full rounded-none" />
        <Skeleton className="h-9 w-24 rounded-none" />
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6 max-w-lg">
      <input type="hidden" name="accountMode" value={accountMode} />

      <p className="text-sm text-muted-foreground">{t.account.accountTypeDesc}</p>

      <div className="grid gap-3">
        <Button
          type="button"
          variant={accountMode === "family" ? "default" : "outline"}
          className="h-auto w-full justify-start rounded-none p-4 text-left"
          onClick={() => setAccountMode("family")}
        >
          <div className="flex items-start gap-3">
            <Heart className="size-5 mt-0.5" />
            <div>
              <p className="font-heading font-semibold text-sm">{t.onboarding.familyTitle}</p>
              <p className="text-xs font-normal opacity-80">{t.onboarding.familyDesc}</p>
            </div>
          </div>
        </Button>

        <Button
          type="button"
          variant={accountMode === "solo" ? "default" : "outline"}
          className="h-auto w-full justify-start rounded-none p-4 text-left"
          onClick={() => setAccountMode("solo")}
        >
          <div className="flex items-start gap-3">
            <User className="size-5 mt-0.5" />
            <div>
              <p className="font-heading font-semibold text-sm">{t.onboarding.soloTitle}</p>
              <p className="text-xs font-normal opacity-80">{t.onboarding.soloDesc}</p>
            </div>
          </div>
        </Button>
      </div>

      {accountMode === "family" && !profile.family_id && (
        <div className="space-y-1.5">
          <Label htmlFor="settings-familyName">{t.account.familyNameLabel}</Label>
          <Input
            id="settings-familyName"
            name="familyName"
            placeholder={t.account.familyNamePlaceholder}
          />
        </div>
      )}

      {accountMode === "solo" && profile.account_mode === "family" && (
        <p className="text-xs text-muted-foreground rounded-none bg-muted/50 px-3 py-2">
          {t.account.soloWarning}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? t.account.saving : t.account.save}
      </Button>
    </form>
  );
}
