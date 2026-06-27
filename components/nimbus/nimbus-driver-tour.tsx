"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { driver, type Driver } from "driver.js";
import {
  buildNimbusDriverSteps,
  getNimbusDriverStepData,
} from "@/lib/nimbus/build-driver-steps";
import { decorateNimbusDriverPopover } from "@/lib/nimbus/driver-tour-popover";
import { prepareNimbusTourStep } from "@/lib/nimbus/prepare-nimbus-tour-step";
import { getNimbusTourSteps } from "@/lib/nimbus/tour-catalog";
import { NIMBUS_TOUR_HIGHLIGHT_PADDING } from "@/lib/constants/nimbus";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useT } from "@/lib/lang-context";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function NimbusDriverTour() {
  const t = useT();
  const router = useRouter();
  const tourActive = useNimbusStore((s) => s.tourActive);
  const activeTourId = useNimbusStore((s) => s.activeTourId);
  const endTour = useNimbusStore((s) => s.endTour);
  const pauseTour = useNimbusStore((s) => s.pauseTour);
  const driverRef = useRef<Driver | null>(null);
  const finishingRef = useRef<boolean>(false);
  const navigatingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!tourActive || !activeTourId) {
      finishingRef.current = false;
      driverRef.current?.destroy();
      driverRef.current = null;
      return;
    }

    const catalogSteps = getNimbusTourSteps(activeTourId);
    if (catalogSteps.length === 0) {
      endTour();
      return;
    }

    const startIndex = Math.min(
      Math.max(0, useNimbusStore.getState().tourStepIndex),
      catalogSteps.length - 1
    );

    const steps = buildNimbusDriverSteps(
      catalogSteps,
      t,
      t.nimbusTour.targetMissing
    );

    let cancelled = false;

    async function moveWithNavigation(
      driverObj: Driver,
      direction: "next" | "previous"
    ) {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      try {
        const currentIndex = driverObj.getActiveIndex() ?? 0;
        const targetIndex =
          direction === "next" ? currentIndex + 1 : currentIndex - 1;
        const targetStep = catalogSteps[targetIndex];
        await prepareNimbusTourStep(targetStep, router);
        if (cancelled) return;

        if (direction === "next") driverObj.moveNext();
        else driverObj.movePrevious();

        useNimbusStore.setState({ tourStepIndex: targetIndex });
      } finally {
        navigatingRef.current = false;
      }
    }

    function goNext(driverObj: Driver) {
      if (driverObj.isLastStep()) {
        finishingRef.current = true;
        endTour({ clearResume: true });
        driverObj.destroy();
        return;
      }
      void moveWithNavigation(driverObj, "next");
    }

    function goPrev(driverObj: Driver) {
      if (driverObj.isFirstStep()) return;
      void moveWithNavigation(driverObj, "previous");
    }

    function handleTourKeyDown(event: KeyboardEvent) {
      const driverObj = driverRef.current;
      if (!driverObj?.isActive() || navigatingRef.current) return;
      if (isEditableTarget(event.target)) return;

      switch (event.key) {
        case "a":
        case "A":
          event.preventDefault();
          goPrev(driverObj);
          break;
        case "d":
        case "D":
          event.preventDefault();
          goNext(driverObj);
          break;
      }
    }

    window.addEventListener("keydown", handleTourKeyDown, true);

    const driverObj = driver({
      steps,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.48,
      smoothScroll: true,
      stagePadding: NIMBUS_TOUR_HIGHLIGHT_PADDING,
      stageRadius: 0,
      showProgress: false,
      popoverClass: "nimbus-driver-popover",
      nextBtnText: t.nimbusTour.next,
      prevBtnText: t.nimbusTour.back,
      doneBtnText: t.nimbusTour.finish,
      allowKeyboardControl: true,
      overlayClickBehavior: (_element, _step, { driver: activeDriver }) => {
        pauseTour();
        activeDriver.destroy();
      },
      onCloseClick: (_element, _step, { driver: activeDriver }) => {
        pauseTour();
        activeDriver.destroy();
      },
      onNextClick: (_element, _step, { driver: activeDriver }) => {
        goNext(activeDriver);
      },
      onPrevClick: (_element, _step, { driver: activeDriver }) => {
        goPrev(activeDriver);
      },
      onHighlighted: (_element, _step, { driver: activeDriver }) => {
        const index = activeDriver.getActiveIndex();
        if (index !== undefined) {
          useNimbusStore.setState({ tourStepIndex: index });
        }
      },
      onPopoverRender: (popover, { driver: activeDriver }) => {
        const activeStep = activeDriver.getActiveStep();
        const meta = activeStep ? getNimbusDriverStepData(activeStep) : null;
        const nimbusStep = meta?.step;
        const targetMissing =
          !!nimbusStep &&
          nimbusStep.variant !== "summary" &&
          !document.querySelector<HTMLElement>(
            `[data-nimbus-tour="${nimbusStep.target}"]`
          );

        decorateNimbusDriverPopover(popover, t, activeDriver, targetMissing);
      },
      onDestroyed: () => {
        if (!finishingRef.current && useNimbusStore.getState().tourActive) {
          pauseTour();
        }
        finishingRef.current = false;
        driverRef.current = null;
      },
    });

    driverRef.current = driverObj;

    void (async () => {
      await prepareNimbusTourStep(catalogSteps[startIndex], router);
      if (cancelled) return;
      driverObj.drive(startIndex);
    })();

    return () => {
      cancelled = true;
      finishingRef.current = false;
      window.removeEventListener("keydown", handleTourKeyDown, true);
      driverObj.destroy();
      driverRef.current = null;
    };
  }, [tourActive, activeTourId, t, router, endTour, pauseTour]);

  return null;
}
