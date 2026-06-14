"use client";

import { FAMILY_FORM_FIELD } from "@/lib/family/form";
import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsFormFooter } from "@/components/profile/settings/settings-form-footer";
import { useT } from "@/lib/lang-context";
import { formatInviteCode, readInviteCodeFromCookie } from "@/lib/family/invite";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { joinFamilyWithInviteCode } from "@/app/(app)/account/family-invite-actions";
import { Ticket } from "lucide-react";

export function JoinFamilyForm() {
  const t = useT();
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const refreshFamily = useProfileStore((s) => s.refreshFamily);
  const [inviteCode, setInviteCode] = useState<string>(() => readInviteCodeFromCookie());
  const [state, action, pending] = useActionState(joinFamilyWithInviteCode, null);

  useActionFeedback(state, () => {
    void refreshProfile();
    void refreshFamily();
  });

  useEffect(() => {
    if (window.location.hash !== "#join-family") return;
    document.getElementById("join-family")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <form
      id="join-family"
      action={action}
      className="space-y-4 max-w-lg rounded-none border border-border bg-muted/30 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
          <Ticket className="size-5" />
        </span>
        <div className="space-y-1 min-w-0">
          <p className="font-heading text-sm font-semibold">{t.account.joinFamilyTitle}</p>
          <p className="text-xs text-muted-foreground">{t.account.joinFamilyDesc}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="settings-join-invite-code">{t.onboarding.inviteCodeLabel}</Label>
        <Input
          id="settings-join-invite-code"
          name={FAMILY_FORM_FIELD.INVITE_CODE}
          value={inviteCode}
          onChange={(e) => setInviteCode(formatInviteCode(e.target.value))}
          placeholder={t.onboarding.inviteCodePlaceholder}
          className="font-mono uppercase tracking-widest bg-background"
          maxLength={9}
          required
        />
      </div>

      <SettingsFormFooter
        pending={pending}
        savingLabel={t.account.saving}
        saveLabel={t.account.joinFamilySubmit}
      />
    </form>
  );
}
