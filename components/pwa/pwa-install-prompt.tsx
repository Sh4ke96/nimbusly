"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "nimbusly:pwa-install-dismissed";

export function PwaInstallPrompt() {
  const t = useT();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
    if (outcome === "dismissed") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
  }

  function handleDismiss() {
    setVisible(false);
    window.localStorage.setItem(DISMISS_KEY, "1");
  }

  if (!visible || !deferred) return null;

  return (
    <div
      data-testid="pwa-install-prompt"
      className={cn(
        "fixed inset-x-4 z-[60] md:inset-x-auto md:right-4 md:max-w-sm",
        "bottom-[var(--app-mobile-bottom-inset)] md:bottom-4",
        "rounded-none border border-border bg-card p-4 shadow-lg"
      )}
      role="region"
      aria-label={t.pwa.installTitle}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
          <Download className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-heading text-sm font-semibold">{t.pwa.installTitle}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t.pwa.installDesc}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" size="sm" className="rounded-none min-h-10" onClick={handleInstall}>
              {t.pwa.installBtn}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-none min-h-10"
              onClick={handleDismiss}
            >
              {t.pwa.installDismiss}
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
  );
}
