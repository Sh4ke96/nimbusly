"use client";

import { PROFILE_FORM_FIELD } from "@/lib/profile/form";
import { useActionState, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsFormFooter } from "@/components/profile/settings/settings-form-footer";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/lib/stores/profile-store";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import type { AccountMode } from "@/lib/profile";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateAccountMode } from "@/app/(app)/account/actions";
import { Heart, User } from "lucide-react";

function AccountModeBadge({
  selected,
  children,
}: {
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-none [&_svg]:size-6",
        selected
          ? "bg-primary-foreground/15 text-primary-foreground"
          : "bg-primary/10 text-primary"
      )}
    >
      {children}
    </span>
  );
}

export function AccountTypeForm() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const [accountMode, setAccountMode] = useState<AccountMode>(
    profile?.account_mode ?? ACCOUNT_MODE.SOLO
  );
  const [syncedAccountMode, setSyncedAccountMode] = useState<AccountMode | undefined>(
    profile?.account_mode
  );
  const [state, action, pending] = useActionState(updateAccountMode, null);

  if (profile?.account_mode && profile.account_mode !== syncedAccountMode) {
    setSyncedAccountMode(profile.account_mode);
    setAccountMode(profile.account_mode);
  }

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
      <input type="hidden" name={PROFILE_FORM_FIELD.ACCOUNT_MODE} value={accountMode} />

      <p className="text-sm text-muted-foreground">{t.account.accountTypeDesc}</p>

      <div className="grid gap-3">
        <Button
          type="button"
          variant={accountMode === ACCOUNT_MODE.FAMILY ? "default" : "outline"}
          className="h-auto w-full justify-start rounded-none p-4 text-left"
          onClick={() => setAccountMode(ACCOUNT_MODE.FAMILY)}
        >
          <div className="flex items-center gap-4">
            <AccountModeBadge selected={accountMode === ACCOUNT_MODE.FAMILY}>
              <Heart />
            </AccountModeBadge>
            <div>
              <p className="font-heading font-semibold text-sm">{t.onboarding.familyTitle}</p>
              <p className="text-xs font-normal opacity-80">{t.onboarding.familyDesc}</p>
            </div>
          </div>
        </Button>

        <Button
          type="button"
          variant={accountMode === ACCOUNT_MODE.SOLO ? "default" : "outline"}
          className="h-auto w-full justify-start rounded-none p-4 text-left"
          onClick={() => setAccountMode(ACCOUNT_MODE.SOLO)}
        >
          <div className="flex items-center gap-4">
            <AccountModeBadge selected={accountMode === ACCOUNT_MODE.SOLO}>
              <User />
            </AccountModeBadge>
            <div>
              <p className="font-heading font-semibold text-sm">{t.onboarding.soloTitle}</p>
              <p className="text-xs font-normal opacity-80">{t.onboarding.soloDesc}</p>
            </div>
          </div>
        </Button>
      </div>

      {accountMode === ACCOUNT_MODE.FAMILY && !profile.family_id && (
        <div className="space-y-1.5">
          <Label htmlFor="settings-familyName">{t.account.familyNameLabel}</Label>
          <Input
            id="settings-familyName"
            name={PROFILE_FORM_FIELD.FAMILY_NAME}
            placeholder={t.account.familyNamePlaceholder}
          />
        </div>
      )}

      {accountMode === ACCOUNT_MODE.SOLO && profile.account_mode === ACCOUNT_MODE.FAMILY && (
        <p className="text-xs text-muted-foreground rounded-none bg-muted/50 px-3 py-2">
          {t.account.soloWarning}
        </p>
      )}

      <SettingsFormFooter
        pending={pending}
        savingLabel={t.account.saving}
        saveLabel={t.account.save}
      />
    </form>
  );
}
