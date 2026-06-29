"use client";

import { createElement, useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getModuleNotificationPreferences,
  updateEmailDigestEnabled,
  updateModuleNotificationChannel,
  updatePushNotificationsEnabled,
} from "@/app/(app)/account/notification-preferences-actions";
import { NOTIFICATION_CHANNEL, type NotificationChannel } from "@/lib/constants/notification-channels";
import {
  NOTIFICATION_MODULE_IDS,
  type NotificationModuleId,
} from "@/lib/constants/notification-modules";
import { getAppModuleIcon } from "@/lib/constants/app-modules";
import type { NotificationModulePreference } from "@/lib/notifications/module-preferences/types";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { cn } from "@/lib/utils";

function preferenceKey(moduleId: NotificationModuleId, channel: NotificationChannel): string {
  return `${moduleId}:${channel}`;
}

function isChannelEnabled(
  pref: NotificationModulePreference,
  channel: NotificationChannel
): boolean {
  switch (channel) {
    case NOTIFICATION_CHANNEL.IN_APP:
      return pref.inAppEnabled;
    case NOTIFICATION_CHANNEL.PUSH:
      return pref.pushEnabled;
    case NOTIFICATION_CHANNEL.EMAIL_DIGEST:
      return pref.emailDigestEnabled;
  }
}

export function NotificationModulePreferences() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const patchPushNotificationsEnabled = useProfileStore((s) => s.patchPushNotificationsEnabled);
  const patchEmailDigestEnabled = useProfileStore((s) => s.patchEmailDigestEnabled);

  const [preferences, setPreferences] = useState<NotificationModulePreference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const pushMasterEnabled = profile?.push_notifications_enabled !== false;
  const emailMasterEnabled = profile?.email_digest_enabled !== false;

  useEffect(() => {
    void getModuleNotificationPreferences().then((rows) => {
      setPreferences(rows);
      setLoading(false);
    });
  }, []);

  function moduleLabel(moduleId: NotificationModuleId): string {
    return t.dashboard.moduleLabels[moduleId];
  }

  async function onGlobalPushChange(checked: boolean) {
    const next = checked === true;
    patchPushNotificationsEnabled(next);
    await updatePushNotificationsEnabled(next);
  }

  async function onGlobalEmailChange(checked: boolean) {
    const next = checked === true;
    patchEmailDigestEnabled(next);
    await updateEmailDigestEnabled(next);
  }

  async function onModuleChannelChange(
    moduleId: NotificationModuleId,
    channel: NotificationChannel,
    checked: boolean
  ) {
    const next = checked === true;
    setPreferences((current) =>
      current.map((pref) => {
        if (pref.moduleId !== moduleId) return pref;
        if (channel === NOTIFICATION_CHANNEL.IN_APP) {
          return { ...pref, inAppEnabled: next };
        }
        if (channel === NOTIFICATION_CHANNEL.PUSH) {
          return { ...pref, pushEnabled: next };
        }
        return { ...pref, emailDigestEnabled: next };
      })
    );
    await updateModuleNotificationChannel(moduleId, channel, next);
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-10 w-full rounded-none" />
        <Skeleton className="h-48 w-full rounded-none" />
      </div>
    );
  }

  const prefByModule = new Map(preferences.map((pref) => [pref.moduleId, pref]));

  return (
    <div
      className="space-y-8 max-w-3xl"
      data-nimbus-tour={NIMBUS_TOUR_TARGET.SETTINGS_NOTIFICATIONS}
    >
      <p className="text-sm text-muted-foreground">{t.account.notificationSettingsDesc}</p>

      <section className="space-y-4">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t.account.notificationGlobalHeading}
        </h2>
        <div className="space-y-4 border border-border p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="push-notifications-master"
              className="cursor-pointer"
              checked={pushMasterEnabled}
              onCheckedChange={(checked) => void onGlobalPushChange(checked === true)}
            />
            <div className="space-y-1">
              <Label
                htmlFor="push-notifications-master"
                className="cursor-pointer font-medium"
              >
                {t.account.pushNotificationsPrefLabel}
              </Label>
              <p className="text-sm text-muted-foreground">{t.account.pushNotificationsPrefDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="email-digest-master"
              className="cursor-pointer"
              checked={emailMasterEnabled}
              onCheckedChange={(checked) => void onGlobalEmailChange(checked === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="email-digest-master" className="cursor-pointer font-medium">
                {t.account.emailDigestPrefLabel}
              </Label>
              <p className="text-sm text-muted-foreground">{t.account.emailDigestPrefDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t.account.notificationModulesHeading}
        </h2>

        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem] gap-2 border border-border bg-muted/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{t.account.notificationModuleColumn}</span>
          <span className="text-center" title={t.account.notificationChannelInAppDesc}>
            {t.account.notificationChannelInApp}
          </span>
          <span className="text-center" title={t.account.notificationChannelPushDesc}>
            {t.account.notificationChannelPush}
          </span>
          <span className="text-center" title={t.account.notificationChannelEmailDesc}>
            {t.account.notificationChannelEmail}
          </span>
        </div>

        <ul className="divide-y divide-border border border-border">
          {NOTIFICATION_MODULE_IDS.map((moduleId) => {
            const pref = prefByModule.get(moduleId);
            if (!pref) return null;
            const Icon = getAppModuleIcon(moduleId);

            return (
              <li
                key={moduleId}
                className="grid grid-cols-1 gap-3 px-3 py-3 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem] sm:items-center sm:gap-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    {createElement(Icon, { className: "size-4", "aria-hidden": true })}
                  </span>
                  <span className="font-medium text-sm">{moduleLabel(moduleId)}</span>
                </div>

                {(
                  [
                    [NOTIFICATION_CHANNEL.IN_APP, t.account.notificationChannelInApp],
                    [NOTIFICATION_CHANNEL.PUSH, t.account.notificationChannelPush],
                    [NOTIFICATION_CHANNEL.EMAIL_DIGEST, t.account.notificationChannelEmail],
                  ] as const
                ).map(([channel, label]) => {
                  const disabled =
                    (channel === NOTIFICATION_CHANNEL.PUSH && !pushMasterEnabled) ||
                    (channel === NOTIFICATION_CHANNEL.EMAIL_DIGEST && !emailMasterEnabled);
                  const id = preferenceKey(moduleId, channel);

                  return (
                    <Label
                      key={id}
                      htmlFor={id}
                      className={cn(
                        "flex items-center justify-between gap-2 sm:flex-col sm:justify-center",
                        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                      )}
                    >
                      <span className="text-xs text-muted-foreground sm:sr-only">{label}</span>
                      <Checkbox
                        id={id}
                        checked={isChannelEnabled(pref, channel)}
                        disabled={disabled}
                        className={cn(!disabled && "cursor-pointer")}
                        onCheckedChange={(checked) =>
                          void onModuleChannelChange(moduleId, channel, checked === true)
                        }
                        aria-label={`${moduleLabel(moduleId)} — ${label}`}
                      />
                    </Label>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
