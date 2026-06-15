"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  updateNimbusCompanionEnabled,
  updateNimbusCompanionQuiet,
} from "@/app/(app)/account/companion-actions";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useT } from "@/lib/lang-context";

export function NimbusCompanionSetting() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const patchNimbusCompanionEnabled = useProfileStore((s) => s.patchNimbusCompanionEnabled);
  const patchNimbusCompanionQuiet = useProfileStore((s) => s.patchNimbusCompanionQuiet);
  const endTour = useNimbusStore((s) => s.endTour);
  const setMenuOpen = useNimbusStore((s) => s.setMenuOpen);
  const dismissHint = useNimbusStore((s) => s.dismissHint);

  if (!profile) return null;

  const enabled = profile.nimbus_companion_enabled !== false;
  const quiet = profile.nimbus_companion_quiet === true;

  async function onEnabledChange(checked: boolean) {
    const next = checked === true;
    patchNimbusCompanionEnabled(next);
    if (!next) {
      endTour();
      setMenuOpen(false);
      dismissHint();
    }
    await updateNimbusCompanionEnabled(next);
  }

  async function onQuietChange(checked: boolean) {
    const next = checked === true;
    patchNimbusCompanionQuiet(next);
    if (next) {
      dismissHint();
    }
    await updateNimbusCompanionQuiet(next);
  }

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <div className="flex items-start gap-3">
        <Checkbox
          id="nimbus-companion-enabled"
          checked={enabled}
          onCheckedChange={(checked) => void onEnabledChange(checked === true)}
        />
        <div className="space-y-1">
          <Label htmlFor="nimbus-companion-enabled" className="font-medium">
            {t.companion.settingLabel}
          </Label>
          <p className="text-sm text-muted-foreground">{t.companion.settingDesc}</p>
        </div>
      </div>

      {enabled && (
        <div className="flex items-start gap-3 pl-0 sm:pl-1">
          <Checkbox
            id="nimbus-companion-quiet"
            checked={quiet}
            onCheckedChange={(checked) => void onQuietChange(checked === true)}
          />
          <div className="space-y-1">
            <Label htmlFor="nimbus-companion-quiet" className="font-medium">
              {t.companion.quietSettingLabel}
            </Label>
            <p className="text-sm text-muted-foreground">{t.companion.quietSettingDesc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
