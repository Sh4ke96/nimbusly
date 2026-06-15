"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  NIMBUS_TOUR_PREPARE_MS,
  NIMBUS_TOUR_ROUTE_SETTLE_MS,
  NIMBUS_TOUR_SCROLL_SETTLE_MS,
} from "@/lib/constants/nimbus";
import { clearTourHighlightTarget, setTourHighlightTarget } from "@/lib/nimbus/tour-highlight";
import { getNimbusTourSteps } from "@/lib/nimbus/tour-catalog";
import {
  getTourHighlightRect,
  prepareTourStep,
  scrollTourTargetIntoView,
  sleep,
  waitForTourTarget,
} from "@/lib/nimbus/tour-runtime";
import { useNimbusStore } from "@/lib/stores/nimbus-store";

export function NimbusTourSync() {
  const router = useRouter();
  const pathname = usePathname();
  const tourActive = useNimbusStore((s) => s.tourActive);
  const activeTourId = useNimbusStore((s) => s.activeTourId);
  const tourStepIndex = useNimbusStore((s) => s.tourStepIndex);
  const setTourLayout = useNimbusStore((s) => s.setTourLayout);
  const patchTourLayout = useNimbusStore((s) => s.patchTourLayout);

  const steps = activeTourId ? getNimbusTourSteps(activeTourId) : [];
  const step = steps[tourStepIndex];
  const stepId = step?.id;
  const stepRoute = step?.route;
  const stepTarget = step?.target;
  const stepPrepare = step?.prepare;
  const stepVariant = step?.variant;

  useEffect(() => {
    if (!tourActive) {
      clearTourHighlightTarget();
    }
  }, [tourActive]);

  useEffect(() => {
    if (!tourActive || !activeTourId || !step || !stepRoute || !stepTarget) return;

    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        patchTourLayout({ syncing: true, targetMissing: false });

        if (pathname !== stepRoute) {
          router.push(stepRoute);
          return;
        }

        prepareTourStep(stepPrepare);
        await sleep(NIMBUS_TOUR_PREPARE_MS);
        if (cancelled) return;

        await sleep(NIMBUS_TOUR_ROUTE_SETTLE_MS);
        if (cancelled) return;

        if (stepVariant === "summary") {
          clearTourHighlightTarget();
          setTourLayout({
            rect: null,
            targetMissing: false,
            syncing: false,
          });
          return;
        }

        const element = await waitForTourTarget(stepTarget);
        if (cancelled) return;

        if (!element) {
          clearTourHighlightTarget();
          setTourLayout({
            rect: useNimbusStore.getState().tourLayout.rect,
            targetMissing: true,
            syncing: false,
          });
          return;
        }

        scrollTourTargetIntoView(element);
        await sleep(NIMBUS_TOUR_SCROLL_SETTLE_MS);
        if (cancelled) return;

        setTourHighlightTarget(element);
        setTourLayout({
          rect: getTourHighlightRect(element),
          targetMissing: false,
          syncing: false,
        });
      })();
    }, 0);

    function onResize() {
      window.setTimeout(() => {
        const element = document.querySelector<HTMLElement>(
          `[data-nimbus-tour="${stepTarget}"]`
        );
        if (!element) return;
        setTourLayout({
          rect: getTourHighlightRect(element),
          targetMissing: false,
          syncing: false,
        });
      }, 0);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [
    tourActive,
    activeTourId,
    tourStepIndex,
    pathname,
    router,
    setTourLayout,
    patchTourLayout,
    stepId,
    stepRoute,
    stepTarget,
    stepPrepare,
    stepVariant,
    step,
  ]);

  return null;
}
