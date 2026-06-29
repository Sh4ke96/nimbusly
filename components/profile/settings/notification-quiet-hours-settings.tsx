"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateNotificationQuietHours,
  updateWeeklyDigestEnabled,
} from "@/app/(app)/account/notification-preferences-actions";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";

export function NotificationQuietHoursSettings() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const patchProfileQuiet = useProfileStore((s) => s.patchNotificationQuietHours);
  const patchWeeklyDigest = useProfileStore((s) => s.patchWeeklyDigestEnabled);

  const [quietEnabled, setQuietEnabled] = useState<boolean>(
    profile?.notification_quiet_hours_enabled === true
  );
  const [quietStart, setQuietStart] = useState<string>(
    profile?.notification_quiet_start?.slice(0, 5) ?? "22:00"
  );
  const [quietEnd, setQuietEnd] = useState<string>(
    profile?.notification_quiet_end?.slice(0, 5) ?? "07:00"
  );
  const [weeklyEnabled, setWeeklyEnabled] = useState<boolean>(
    profile?.weekly_digest_enabled === true
  );

  async function onQuietEnabledChange(checked: boolean) {
    const next = checked === true;
    setQuietEnabled(next);
    patchProfileQuiet({
      enabled: next,
      start: quietStart,
      end: quietEnd,
    });
    await updateNotificationQuietHours({
      enabled: next,
      start: quietStart,
      end: quietEnd,
    });
  }

  async function onQuietTimeBlur() {
    patchProfileQuiet({
      enabled: quietEnabled,
      start: quietStart,
      end: quietEnd,
    });
    await updateNotificationQuietHours({
      enabled: quietEnabled,
      start: quietStart,
      end: quietEnd,
    });
  }

  async function onWeeklyChange(checked: boolean) {
    const next = checked === true;
    setWeeklyEnabled(next);
    patchWeeklyDigest(next);
    await updateWeeklyDigestEnabled(next);
  }

  return (
    <div className="space-y-6 max-w-2xl border border-border p-4">
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-base">{t.account.quietHoursTitle}</h3>

        <p className="text-sm text-muted-foreground">{t.account.quietHoursDesc}</p>

        <div className="flex items-start gap-3">
          <Checkbox
            id="quiet-hours-enabled"
            checked={quietEnabled}
            onCheckedChange={(checked) => void onQuietEnabledChange(checked === true)}
            className="mt-0.5 cursor-pointer"
          />
          <div className="space-y-1">
            <Label htmlFor="quiet-hours-enabled" className="font-medium cursor-pointer">
              {t.account.quietHoursEnabledLabel}
            </Label>
            <p className="text-xs text-muted-foreground">{t.account.quietHoursEnabledDesc}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="quiet-start">{t.account.quietHoursStartLabel}</Label>
          <Input
            id="quiet-start"
            type="time"
            value={quietStart}
            onChange={(e) => setQuietStart(e.target.value)}
            onBlur={() => void onQuietTimeBlur()}
            disabled={!quietEnabled}
            className="rounded-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quiet-end">{t.account.quietHoursEndLabel}</Label>
          <Input
            id="quiet-end"
            type="time"
            value={quietEnd}
            onChange={(e) => setQuietEnd(e.target.value)}
            onBlur={() => void onQuietTimeBlur()}
            disabled={!quietEnabled}
            className="rounded-none"
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="weekly-digest-enabled"
            checked={weeklyEnabled}
            onCheckedChange={(checked) => void onWeeklyChange(checked === true)}
            className="mt-0.5 cursor-pointer"
          />
          <div className="space-y-1">
            <Label htmlFor="weekly-digest-enabled" className="font-medium cursor-pointer">
              {t.account.weeklyDigestLabel}
            </Label>
            <p className="text-xs text-muted-foreground">{t.account.weeklyDigestDesc}</p>
          </div>
        </div>

        <div className="space-y-2 border border-border bg-card p-4">
          <p className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">
            {t.account.weeklyDigestPreviewTitle}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t.account.weeklyDigestPreviewDesc}
          </p>
          <div className="border border-border bg-background p-4 space-y-3 text-sm shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Nimbusly</p>
            <div className="space-y-1">
              <p className="font-heading font-semibold text-base">
                {t.notifications.digestWeeklyEmailHeading}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.notifications.digestWeeklyEmailIntro}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold">
                {t.account.weeklyDigestExampleModuleShopping}
              </p>
              <ul className="list-disc pl-5 text-xs text-muted-foreground">
                <li>{t.account.weeklyDigestExampleLineShopping}</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold">{t.account.weeklyDigestExampleModuleChores}</p>
              <ul className="list-disc pl-5 text-xs text-muted-foreground">
                <li>{t.account.weeklyDigestExampleLineChores}</li>
              </ul>
            </div>
            <span className="inline-block bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
              {t.notifications.reminderEmailCta}
            </span>
            <p className="text-[11px] text-muted-foreground pt-1">
              {t.notifications.digestEmailFooter}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t.account.weeklyDigestExampleSubject}
          </p>
        </div>
      </div>
    </div>
  );
}
