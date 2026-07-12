"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateQuickAddEnabled } from "@/app/(app)/account/quick-add-actions";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { toast } from "sonner";

export function QuickAddSetting() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const patchQuickAddEnabled = useProfileStore((s) => s.patchQuickAddEnabled);
  const fetchSession = useProfileStore((s) => s.fetchSession);

  if (!profile) return null;

  const enabled = profile.quick_add_enabled !== false;

  async function onEnabledChange(checked: boolean) {
    const next = checked === true;
    const previous = profile!.quick_add_enabled !== false;
    patchQuickAddEnabled(next);

    const result = await updateQuickAddEnabled(next);
    if (result && "error" in result) {
      patchQuickAddEnabled(previous);
      toast.error(result.error);
      return;
    }

    await fetchSession(true);
  }

  return (
    <div className="flex items-start gap-3 border-t border-border pt-6">
      <Checkbox
        id="quick-add-enabled"
        checked={enabled}
        onCheckedChange={(checked) => void onEnabledChange(checked === true)}
      />
      <div className="space-y-1">
        <Label htmlFor="quick-add-enabled" className="font-medium">
          {t.search.settingLabel}
        </Label>
        <p className="text-sm text-muted-foreground">{t.search.settingDesc}</p>
      </div>
    </div>
  );
}
