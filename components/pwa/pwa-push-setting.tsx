"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/lang-context";
import { removePushSubscription, savePushSubscription } from "@/app/(app)/push/actions";
import {
  getPushUnsupportedReason,
  isPushSupported,
} from "@/lib/push/client-support";
import { getSubscribePushErrorMessage } from "@/lib/push/subscribe-errors";
import {
  hasActivePushSubscription,
  readBrowserPushSubscription,
  subscribeBrowserToPush,
  unsubscribeBrowserFromPush,
} from "@/lib/push/subscribe-client";
import { PUSH_UNSUPPORTED_REASON } from "@/lib/constants/push";

async function persistPushSubscription(userAgent: string | null): Promise<boolean> {
  const subscription = await readBrowserPushSubscription();
  if (!subscription) return false;
  const result = await savePushSubscription(subscription, userAgent);
  return !result?.error;
}

export function PwaPushSetting() {
  const t = useT();
  const [supported, setSupported] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [busy, setBusy] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      setLoaded(true);
      return;
    }

    const unsupported = getPushUnsupportedReason();
    const ok = unsupported === null;
    setSupported(ok);
    setPermission(typeof Notification !== "undefined" ? Notification.permission : "denied");

    if (!ok) {
      setLoaded(true);
      return;
    }

    void (async () => {
      const active = await hasActivePushSubscription();
      if (active) {
        const saved = await persistPushSubscription(
          typeof navigator !== "undefined" ? navigator.userAgent : null
        );
        setSubscribed(saved || active);
      }
      setLoaded(true);
    })();
  }, []);

  async function handleEnable() {
    setBusy(true);
    try {
      const result = await subscribeBrowserToPush();
      setPermission(Notification.permission);
      if (!result.ok) {
        toast.error(getSubscribePushErrorMessage(result.reason, t.pwa));
        return;
      }
      const saveResult = await savePushSubscription(
        result.subscription,
        typeof navigator !== "undefined" ? navigator.userAgent : null
      );
      if (saveResult?.error) {
        toast.error(t.pwa.pushError);
        return;
      }
      setSubscribed(true);
      toast.success(t.pwa.pushEnabled);
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    try {
      await unsubscribeBrowserFromPush();
      await removePushSubscription();
      setSubscribed(false);
      toast.success(t.pwa.pushDisabled);
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return null;

  const unsupportedReason = getPushUnsupportedReason();
  let hint = t.pwa.pushSettingDesc;
  if (process.env.NODE_ENV !== "production") {
    hint = t.pwa.pushDevOnly;
  } else if (unsupportedReason === PUSH_UNSUPPORTED_REASON.IOS_NOT_INSTALLED) {
    hint = t.pwa.pushIosInstallRequired;
  } else if (unsupportedReason === PUSH_UNSUPPORTED_REASON.NO_VAPID) {
    hint = t.pwa.pushNotConfigured;
  } else if (!supported && unsupportedReason === PUSH_UNSUPPORTED_REASON.NO_API) {
    hint = t.pwa.pushUnsupported;
  } else if (permission === "denied") {
    hint = t.pwa.pushDeniedHint;
  } else if (permission === "granted" && !subscribed) {
    hint = t.pwa.pushGrantedTapEnable;
  }

  const canToggle =
    process.env.NODE_ENV === "production" && isPushSupported() && permission !== "denied";

  return (
    <div className="space-y-3 border-t border-border pt-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary">
          <BellRing className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <Label className="font-medium">{t.pwa.pushSettingLabel}</Label>
          <p className="text-sm text-muted-foreground">{hint}</p>
          {canToggle && (
            <div className="pt-2">
              {subscribed ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-none min-h-10"
                  disabled={busy}
                  onClick={() => void handleDisable()}
                >
                  {t.pwa.pushDisableBtn}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="rounded-none min-h-10"
                  disabled={busy}
                  onClick={() => void handleEnable()}
                >
                  {t.pwa.pushEnableBtn}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
