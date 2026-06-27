import { DASHBOARD_VIEW } from "@/lib/constants/dashboard";
import {
  NIMBUS_DASHBOARD_VIEW_EVENT,
  NIMBUS_SETTINGS_TAB_EVENT,
  NIMBUS_TOUR_HIGHLIGHT_PADDING,
} from "@/lib/constants/nimbus";
import { SETTINGS_TAB } from "@/lib/constants/settings";
import {
  NIMBUS_TOUR_PREPARE,
  type NimbusTourPrepare,
} from "@/lib/nimbus/tour-catalog";

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function dispatchDashboardView(view: (typeof DASHBOARD_VIEW)[keyof typeof DASHBOARD_VIEW]) {
  window.dispatchEvent(new CustomEvent(NIMBUS_DASHBOARD_VIEW_EVENT, { detail: view }));
}

export function dispatchSettingsTab(tab: string) {
  window.dispatchEvent(new CustomEvent(NIMBUS_SETTINGS_TAB_EVENT, { detail: tab }));
}

export function prepareTourStep(prepare: NimbusTourPrepare | undefined) {
  if (!prepare) return;

  switch (prepare) {
    case NIMBUS_TOUR_PREPARE.DASHBOARD_SUMMARY:
      dispatchDashboardView(DASHBOARD_VIEW.SUMMARY);
      break;
    case NIMBUS_TOUR_PREPARE.DASHBOARD_MODULES:
      dispatchDashboardView(DASHBOARD_VIEW.MODULES);
      break;
    case NIMBUS_TOUR_PREPARE.SETTINGS_PROFILE:
      dispatchSettingsTab(SETTINGS_TAB.PROFILE);
      break;
    case NIMBUS_TOUR_PREPARE.SETTINGS_ACCOUNT:
      dispatchSettingsTab(SETTINGS_TAB.ACCOUNT);
      break;
    case NIMBUS_TOUR_PREPARE.SETTINGS_FAMILY:
      dispatchSettingsTab(SETTINGS_TAB.FAMILY);
      break;
    case NIMBUS_TOUR_PREPARE.SETTINGS_PERMISSIONS:
      dispatchSettingsTab(SETTINGS_TAB.FAMILY);
      break;
    case NIMBUS_TOUR_PREPARE.SETTINGS_PASSWORD:
      dispatchSettingsTab(SETTINGS_TAB.PASSWORD);
      break;
  }
}

export async function waitForTourTarget(
  target: string,
  timeoutMs = 8000
): Promise<HTMLElement | null> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const element = document.querySelector<HTMLElement>(`[data-nimbus-tour="${target}"]`);
    if (element) return element;
    await sleep(80);
  }

  return null;
}

export function scrollTourTargetIntoView(element: HTMLElement) {
  const margin = 96;
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const fullyVisible =
    rect.top >= margin &&
    rect.bottom <= viewportHeight - margin &&
    rect.left >= margin &&
    rect.right <= viewportWidth - margin;

  if (fullyVisible) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest",
  });
}

export function getTourHighlightRect(
  element: HTMLElement,
  padding = NIMBUS_TOUR_HIGHLIGHT_PADDING
) {
  const rect = element.getBoundingClientRect();
  return {
    top: Math.max(8, rect.top - padding),
    left: Math.max(8, rect.left - padding),
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}
