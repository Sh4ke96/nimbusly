"use client";

import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { PUSH_DISMISS_KEY } from "@/lib/constants/push";
import { savePushSubscription } from "@/app/(app)/push/actions";
import {
  shouldOfferPushPrompt,
  isPushSupported,
} from "@/lib/push/client-support";
import { getSubscribePushErrorMessage } from "@/lib/push/subscribe-errors";
import {
  hasActivePushSubscription,
  subscribeBrowserToPush,
} from "@/lib/push/subscribe-client";
import { useProfileStore } from "@/lib/stores/profile-store";

export function PwaPushPrompt() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const [visible, setVisible] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!user) return;
    if (!shouldOfferPushPrompt()) return;

    void hasActivePushSubscription().then((subscribed) => {
      if (!subscribed && isPushSupported()) {
        setVisible(true);
      }
    });
  }, [user]);

  function handleDismiss() {
    setVisible(false);
    window.localStorage.setItem(PUSH_DISMISS_KEY, "1");
  }

  async function handleEnable() {
    setBusy(true);
    try {
      const result = await subscribeBrowserToPush();
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
      toast.success(t.pwa.pushEnabled);
      setVisible(false);
      window.localStorage.setItem(PUSH_DISMISS_KEY, "1");
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      data-testid="pwa-push-prompt"
      className={cn(
        "fixed inset-x-4 z-60 md:inset-x-auto md:left-4 md:max-w-sm",
        "bottom-[calc(var(--app-mobile-bottom-inset)+5.5rem)] md:bottom-4"
      )}
      role="region"
      aria-label={t.pwa.pushPromptTitle}
    >
      <div className="rounded-none border border-border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
            <BellRing className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-heading text-sm font-semibold">{t.pwa.pushPromptTitle}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.pwa.pushPromptDesc}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                className="rounded-none min-h-10"
                disabled={busy}
                onClick={() => void handleEnable()}
              >
                {t.pwa.pushPromptBtn}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-none min-h-10"
                onClick={handleDismiss}
              >
                {t.pwa.pushPromptDismiss}
              </Button>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 rounded-none"
            onClick={handleDismiss}
            aria-label={t.common.close}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
