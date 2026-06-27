import {
  NIMBUS_TOUR_PREPARE_MS,
  NIMBUS_TOUR_ROUTE_SETTLE_MS,
  NIMBUS_TOUR_SCROLL_SETTLE_MS,
} from "@/lib/constants/nimbus";
import type { NimbusTourStep } from "@/lib/nimbus/tour-catalog";
import {
  prepareTourStep,
  scrollTourTargetIntoView,
  sleep,
  waitForTourTarget,
} from "@/lib/nimbus/tour-runtime";

export async function prepareNimbusTourStep(
  step: NimbusTourStep | undefined,
  router: { push: (href: string) => void }
): Promise<HTMLElement | null> {
  if (!step) return null;

  const pathname = window.location.pathname;
  if (step.route && pathname !== step.route) {
    router.push(step.route);
    await sleep(NIMBUS_TOUR_ROUTE_SETTLE_MS);

    let attempts = 0;
    while (window.location.pathname !== step.route && attempts < 50) {
      await sleep(100);
      attempts += 1;
    }
  }

  prepareTourStep(step.prepare);
  await sleep(NIMBUS_TOUR_PREPARE_MS);

  if (step.variant === "summary") return null;

  const element = await waitForTourTarget(step.target);
  if (!element) return null;

  scrollTourTargetIntoView(element);
  await sleep(NIMBUS_TOUR_SCROLL_SETTLE_MS);
  return element;
}
