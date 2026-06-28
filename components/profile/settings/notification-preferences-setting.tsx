"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  updateEmailDigestEnabled,
  updatePushNotificationsEnabled,
} from "@/app/(app)/account/notification-preferences-actions";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";

export function NotificationPreferencesSetting() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const patchPushNotificationsEnabled = useProfileStore((s) => s.patchPushNotificationsEnabled);
  const patchEmailDigestEnabled = useProfileStore((s) => s.patchEmailDigestEnabled);

  if (!profile) return null;

  const pushEnabled = profile.push_notifications_enabled !== false;
  const emailDigestEnabled = profile.email_digest_enabled !== false;

  async function onPushEnabledChange(checked: boolean) {
    const next = checked === true;
    patchPushNotificationsEnabled(next);
    await updatePushNotificationsEnabled(next);
  }

  async function onEmailDigestChange(checked: boolean) {
    const next = checked === true;
    patchEmailDigestEnabled(next);
    await updateEmailDigestEnabled(next);
  }

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <div className="flex items-start gap-3">
        <Checkbox
          id="push-notifications-enabled"
          checked={pushEnabled}
          onCheckedChange={(checked) => void onPushEnabledChange(checked === true)}
        />
        <div className="space-y-1">
          <Label htmlFor="push-notifications-enabled" className="font-medium">
            {t.account.pushNotificationsPrefLabel}
          </Label>
          <p className="text-sm text-muted-foreground">{t.account.pushNotificationsPrefDesc}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="email-digest-enabled"
          checked={emailDigestEnabled}
          onCheckedChange={(checked) => void onEmailDigestChange(checked === true)}
        />
        <div className="space-y-1">
          <Label htmlFor="email-digest-enabled" className="font-medium">
            {t.account.emailDigestPrefLabel}
          </Label>
          <p className="text-sm text-muted-foreground">{t.account.emailDigestPrefDesc}</p>
        </div>
      </div>
    </div>
  );
}
