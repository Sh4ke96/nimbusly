export { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";

export const NIMBUS_DASHBOARD_VIEW_EVENT = "nimbusly:dashboard-view";
export const NIMBUS_SETTINGS_TAB_EVENT = "nimbusly:settings-tab";

export const NIMBUS_HINT_ACTION_LABEL = {
  GO: "go",
  SHOW: "show",
  TOUR: "tour",
} as const;

export type NimbusHintActionLabel =
  (typeof NIMBUS_HINT_ACTION_LABEL)[keyof typeof NIMBUS_HINT_ACTION_LABEL];

export const NIMBUS_HINT_FIRST_DELAY_MS = 30_000;
export const NIMBUS_HINT_INTERVAL_MS = 180_000;
export const NIMBUS_HINT_COUNT = 10;
export const NIMBUS_JOKE_CHANCE = 0.22;
export const NIMBUS_SESSION_GREETING_DELAY_MS = 4_000;
export const NIMBUS_CALLING_LEAD_MS = 1_400;
export const NIMBUS_IDLE_FIDGET_MIN_MS = 50_000;
export const NIMBUS_IDLE_FIDGET_MAX_MS = 90_000;

export const NIMBUS_TOUR_PREPARE_MS = 320;
export const NIMBUS_TOUR_ROUTE_SETTLE_MS = 420;
export const NIMBUS_TOUR_SCROLL_SETTLE_MS = 520;
export const NIMBUS_TOUR_HIGHLIGHT_PADDING = 14;
