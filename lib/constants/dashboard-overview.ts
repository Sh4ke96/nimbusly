import {
  APP_MODULE,
  APP_MODULE_IDS,
  type AppModuleId,
} from "@/lib/constants/app-modules";

/** Overview card ids match {@link AppModuleId}. */
export const DASHBOARD_OVERVIEW_CARD = APP_MODULE;

export const DASHBOARD_OVERVIEW_CARDS = APP_MODULE_IDS;

export type DashboardOverviewCardId = AppModuleId;

export const DEFAULT_DASHBOARD_OVERVIEW_ORDER: DashboardOverviewCardId[] = [
  ...DASHBOARD_OVERVIEW_CARDS,
];
