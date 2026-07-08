"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { useT } from "@/lib/lang-context";
import { isStandaloneDisplay } from "@/lib/pwa/is-standalone-display";
import { removeStaticPwaSplash } from "@/lib/pwa/startup-splash";
import { useProfileStore } from "@/lib/stores/profile-store";
import { cn } from "@/lib/utils";

const MIN_VISIBLE_MS = 600;
const PROFILE_WAIT_MS = 2500;
const MAX_WAIT_MS = 10000;

type SplashPhase = "visible" | "exiting" | "hidden";

export function PwaStartupSplash() {
  const t = useT();
  const [phase, setPhase] = useState<SplashPhase>(() =>
    isStandaloneDisplay() ? "visible" : "hidden"
  );
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!isStandaloneDisplay()) {
      removeStaticPwaSplash();
      return;
    }

    const started = Date.now();
    let rafId = 0;
    let hideTimer: number | undefined;

    const finish = () => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      setPhase("exiting");
      hideTimer = window.setTimeout(() => {
        removeStaticPwaSplash();
        setPhase("hidden");
      }, 280);
    };

    const canDismiss = () => {
      const elapsed = Date.now() - started;
      const domReady = document.readyState === "complete";
      const profileLoaded = useProfileStore.getState().loaded;

      if (elapsed >= MAX_WAIT_MS) return true;
      if (!domReady || elapsed < MIN_VISIBLE_MS) return false;

      return profileLoaded || elapsed >= PROFILE_WAIT_MS;
    };

    const attemptDismiss = () => {
      if (dismissedRef.current) return;
      if (!canDismiss()) {
        rafId = window.requestAnimationFrame(attemptDismiss);
        return;
      }
      finish();
    };

    rafId = window.requestAnimationFrame(attemptDismiss);
    const unsubscribe = useProfileStore.subscribe(() => {
      attemptDismiss();
    });

    return () => {
      dismissedRef.current = true;
      unsubscribe();
      window.cancelAnimationFrame(rafId);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  const isVisible = phase === "visible";

  return (
    <div
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
