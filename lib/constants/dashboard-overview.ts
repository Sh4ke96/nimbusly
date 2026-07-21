import { APP_MODULE, type AppModuleId } from "@/lib/constants/app-modules";

/** Overview card ids match dashboard modules (excludes unified family calendar view). */
export const DASHBOARD_OVERVIEW_CARD = APP_MODULE;

export const DASHBOARD_OVERVIEW_CARD_IDS = [
  APP_MODULE.BUDGET,
  APP_MODULE.SHOPPING,
  APP_MODULE.GIFTS,
  APP_MODULE.MEDICINE_CABINET,
  APP_MODULE.WATCHLIST,
  APP_MODULE.RESTAURANTS,
  APP_MODULE.PETS,
  APP_MODULE.CHORES,
  APP_MODULE.NOTES,
  APP_MODULE.BIRTHDAYS,
  APP_MODULE.CALENDAR,
  APP_MODULE.FAMILY_CALENDAR,
  APP_MODULE.FAMILY,
] as const satisfies readonly AppModuleId[];

export type DashboardOverviewCardId = (typeof DASHBOARD_OVERVIEW_CARD_IDS)[number];

export const DASHBOARD_OVERVIEW_CARDS: DashboardOverviewCardId[] = [
  ...DASHBOARD_OVERVIEW_CARD_IDS,
];

export const DEFAULT_DASHBOARD_OVERVIEW_ORDER: DashboardOverviewCardId[] = [
  ...DASHBOARD_OVERVIEW_CARDS,
];

export const DASHBOARD_OVERVIEW_CARD_ID_SET = new Set<string>(DASHBOARD_OVERVIEW_CARD_IDS);

export function isDashboardOverviewCardId(value: string): value is DashboardOverviewCardId {
  return DASHBOARD_OVERVIEW_CARD_ID_SET.has(value);
}
