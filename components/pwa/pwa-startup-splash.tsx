"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { useT } from "@/lib/lang-context";
import { isStandaloneDisplay } from "@/lib/pwa/is-standalone-display";
import { cn } from "@/lib/utils";

const MIN_VISIBLE_MS = 350;

type SplashPhase = "visible" | "exiting" | "hidden";

export function PwaStartupSplash() {
  const t = useT();
  const [phase, setPhase] = useState<SplashPhase>("visible");

  useEffect(() => {
    if (!isStandaloneDisplay()) {
      setPhase("hidden");
      return;
    }

    const started = Date.now();

    const dismiss = () => {
      const elapsed = Date.now() - started;
      const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(() => {
        setPhase("exiting");
        window.setTimeout(() => setPhase("hidden"), 280);
      }, delay);
    };

    if (document.readyState === "complete") {
      dismiss();
      return;
    }

    window.addEventListener("load", dismiss, { once: true });
    return () => window.removeEventListener("load", dismiss);
  }, []);

  if (phase === "hidden") return null;

  const isVisible = phase === "visible";

  return (
    <div
      id="pwa-startup-splash"
      role="status"
      aria-live="polite"
      aria-busy={isVisible}
      aria-label={t.pwa.startupLoading}
      className={cn(
        "fixed inset-0 z-10000 flex flex-col items-center justify-center bg-background",
        "transition-[opacity,visibility] duration-300 ease-out",
        isVisible ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
      )}
    >
      <Logo
        asLink={false}
        showWordmark={false}
        size="lg"
        className="animate-navigation-logo-pulse"
      />
    </div>
  );
}
