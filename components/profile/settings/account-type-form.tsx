"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import type { AccountMode } from "@/lib/profile";
import { updateAccountMode, type AccountActionState } from "@/app/(app)/account/actions";
import { ActionMessage } from "@/components/profile/action-message";
import { Heart, User } from "lucide-react";

function useFormSuccess(state: AccountActionState, onSuccess: () => void) {
  const handled = useRef(false);

  useEffect(() => {
    handled.current = false;
  }, []);

  useEffect(() => {
    if (!state || !("success" in state) || handled.current) return;
    handled.current = true;
    onSuccess();
  }, [state, onSuccess]);
}

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

  useFormSuccess(state, () => void refreshProfile());

  if (!profile) return null;

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

      <ActionMessage state={state} />

      <Button type="submit" disabled={pending}>
        {pending ? t.account.saving : t.account.save}
      </Button>
    </form>
  );
}
