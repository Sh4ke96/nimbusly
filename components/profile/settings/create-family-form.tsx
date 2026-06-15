"use client";

import { PROFILE_FORM_FIELD } from "@/lib/profile/form";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsFormFooter } from "@/components/profile/settings/settings-form-footer";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createFamily } from "@/app/(app)/account/family-member-actions";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { Users } from "lucide-react";

export function CreateFamilyForm() {
  const t = useT();
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const refreshFamily = useProfileStore((s) => s.refreshFamily);
  const [state, action, pending] = useActionState(createFamily, null);

  useActionFeedback(state, () => {
    void refreshProfile();
    void refreshFamily();
  });

  return (
    <form
      action={action}
      data-nimbus-tour={NIMBUS_TOUR_TARGET.SETTINGS_CREATE_FAMILY}
      className="space-y-4 max-w-lg rounded-none border border-border bg-muted/30 p-4"
    >
      <div className="flex items-start gap-3">
        <Users className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-heading text-sm font-semibold">{t.account.createFamilyTitle}</p>
          <p className="text-xs text-muted-foreground">{t.account.createFamilyDesc}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="create-family-name">{t.account.familyNameLabel}</Label>
        <Input
          id="create-family-name"
          name={PROFILE_FORM_FIELD.FAMILY_NAME}
          placeholder={t.account.familyNamePlaceholder}
          required
        />
      </div>

      <SettingsFormFooter
        pending={pending}
        savingLabel={t.account.saving}
        saveLabel={t.account.createFamilySubmit}
      />
    </form>
  );
}
