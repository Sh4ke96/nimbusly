"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { NAV_TRANSITION } from "@/lib/constants/navigation";
import { useClientSearchString } from "@/lib/hooks/use-client-search-string";
import { useT } from "@/lib/lang-context";
import { buildRouteKey, getWindowRouteKey } from "@/lib/navigation/route-key";
import { shouldStartNavigationTransition } from "@/lib/navigation/should-start-transition";
import { cn } from "@/lib/utils";

type TransitionPhase = "idle" | "entering" | "visible" | "exiting";

export function NavigationTransition() {
  const t = useT();
  const pathname = usePathname();
  const search = useClientSearchString();
  const routeKey = buildRouteKey(pathname, search);

  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const pendingRef = useRef(false);
  const startedAtRef = useRef(0);
  const routeKeyRef = useRef(routeKey);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const clearWatchdogTimer = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  const resetTransition = useCallback(() => {
    clearExitTimer();
    clearWatchdogTimer();
    pendingRef.current = false;
    setPhase("idle");
  }, [clearExitTimer, clearWatchdogTimer]);

  const finishTransition = useCallback(() => {
    if (!pendingRef.current) {
      return;
    }

    clearWatchdogTimer();

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, NAV_TRANSITION.MIN_VISIBLE_MS - elapsed);

    clearExitTimer();
    exitTimerRef.current = setTimeout(() => {
      setPhase("exiting");
      exitTimerRef.current = setTimeout(() => {
        pendingRef.current = false;
        setPhase("idle");
        exitTimerRef.current = null;
      }, NAV_TRANSITION.FADE_MS);
    }, remaining);
  }, [clearExitTimer, clearWatchdogTimer]);

  const startTransition = useCallback(
    (options?: { force?: boolean }) => {
      if (pendingRef.current && !options?.force) {
        return;
      }

      clearExitTimer();
      clearWatchdogTimer();
      pendingRef.current = true;
      startedAtRef.current = Date.now();
      setPhase("entering");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase("visible");
        });
      });

      watchdogTimerRef.current = setTimeout(() => {
        resetTransition();
      }, NAV_TRANSITION.MAX_VISIBLE_MS);
    },
    [clearExitTimer, clearWatchdogTimer, resetTransition],
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element).closest("a");
      if (!anchor) {
        return;
      }
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (
        !shouldStartNavigationTransition(
          href,
          window.location.href,
          pathname,
          search,
        )
      ) {
        return;
      }

      startTransition({ force: true });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, search, startTransition]);

  useEffect(() => {
    const onPopState = () => {
      if (pendingRef.current) {
        routeKeyRef.current = getWindowRouteKey();
        finishTransition();
        return;
      }

      startTransition();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [finishTransition, startTransition]);

  useEffect(() => {
    if (pendingRef.current) {
      const windowKey = getWindowRouteKey();
      if (windowKey !== routeKey) {
        routeKeyRef.current = windowKey;
        finishTransition();
        return;
      }
    }

    if (routeKey === routeKeyRef.current) {
      return;
    }

    routeKeyRef.current = routeKey;
    finishTransition();
  }, [routeKey, finishTransition]);

  useEffect(
    () => () => {
      clearExitTimer();
      clearWatchdogTimer();
    },
    [clearExitTimer, clearWatchdogTimer],
  );

  if (phase === "idle") {
    return null;
  }

  const isVisible = phase === "entering" || phase === "visible";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isVisible}
      aria-label={t.navigation.loading}
      className={cn(
        "fixed inset-0 z-9999 flex flex-col items-center justify-center",
        "bg-background/92 backdrop-blur-[2px]",
        "transition-[opacity,visibility] duration-300 ease-out",
        isVisible ? "visible opacity-100" : "invisible pointer-events-none opacity-0",
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
