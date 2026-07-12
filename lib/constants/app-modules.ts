import {
  Cake,
  CalendarDays,
  CalendarRange,
  Clapperboard,
  Cross,
  Gift,
  ListChecks,
  PawPrint,
  ShoppingCart,
  StickyNote,
  UtensilsCrossed,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Dict } from "@/lib/i18n/types";
import type { OverviewAccent } from "@/lib/constants/overview-accent";

export const APP_MODULE = {
  BUDGET: "budget",
  SHOPPING: "shopping",
  GIFTS: "gifts",
  MEDICINE_CABINET: "medicineCabinet",
  WATCHLIST: "watchlist",
  RESTAURANTS: "restaurants",
  PETS: "pets",
  CHORES: "chores",
  NOTES: "notes",
  BIRTHDAYS: "birthdays",
  /** Work / family schedule at `/schedule`. */
  CALENDAR: "calendar",
  /** Unified month view at `/calendar` (not on dashboard overview cards). */
  FAMILY_CALENDAR: "familyCalendar",
  FAMILY: "family",
} as const;

export type AppModuleId = (typeof APP_MODULE)[keyof typeof APP_MODULE];

/** @deprecated Stored layouts may still contain this kebab-case id. */
export const LEGACY_MODULE_ID = {
  MEDICINE_CABINET: "medicine-cabinet",
} as const;

const LEGACY_MODULE_ID_MAP: Record<string, AppModuleId> = {
  [LEGACY_MODULE_ID.MEDICINE_CABINET]: APP_MODULE.MEDICINE_CABINET,
};

export const APP_MODULE_IDS: AppModuleId[] = [
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
  APP_MODULE.FAMILY,
];

/** Module grid dropdown order (family is a separate menu item). */
export const APP_MODULE_NAV_IDS: AppModuleId[] = [
  APP_MODULE.BUDGET,
  APP_MODULE.SHOPPING,
  APP_MODULE.GIFTS,
  APP_MODULE.BIRTHDAYS,
  APP_MODULE.FAMILY_CALENDAR,
  APP_MODULE.CALENDAR,
  APP_MODULE.MEDICINE_CABINET,
  APP_MODULE.WATCHLIST,
  APP_MODULE.RESTAURANTS,
  APP_MODULE.PETS,
  APP_MODULE.CHORES,
  APP_MODULE.NOTES,
];

/** Hero / auth decorative pill order. */
export const APP_MODULE_HERO_IDS: AppModuleId[] = [
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
  APP_MODULE.FAMILY,
];

/** Nav + search entries including modules outside dashboard overview cards. */
export const APP_MODULE_DISCOVER_IDS: AppModuleId[] = [
  ...APP_MODULE_IDS,
  APP_MODULE.FAMILY_CALENDAR,
];

export const APP_MODULE_ROUTES: Record<AppModuleId, string> = {
  [APP_MODULE.BUDGET]: "/budget",
  [APP_MODULE.SHOPPING]: "/shopping",
  [APP_MODULE.GIFTS]: "/gifts",
  [APP_MODULE.MEDICINE_CABINET]: "/medicine-cabinet",
  [APP_MODULE.WATCHLIST]: "/watchlist",
  [APP_MODULE.RESTAURANTS]: "/restaurants",
  [APP_MODULE.PETS]: "/pets",
  [APP_MODULE.CHORES]: "/chores",
  [APP_MODULE.NOTES]: "/notes",
  [APP_MODULE.BIRTHDAYS]: "/birthdays",
  [APP_MODULE.CALENDAR]: "/schedule",
  [APP_MODULE.FAMILY_CALENDAR]: "/calendar",
  [APP_MODULE.FAMILY]: "/family",
};

interface AppModuleMeta {
  icon: LucideIcon;
  overviewAccent: OverviewAccent;
  overviewClassName?: string;
}

const MODULE_META: Record<AppModuleId, AppModuleMeta> = {
  [APP_MODULE.BUDGET]: {
    icon: Wallet,
    overviewAccent: "primary",
    overviewClassName: "sm:col-span-2 xl:col-span-1",
  },
  [APP_MODULE.SHOPPING]: { icon: ShoppingCart, overviewAccent: "orange" },
  [APP_MODULE.GIFTS]: { icon: Gift, overviewAccent: "violet" },
  [APP_MODULE.MEDICINE_CABINET]: { icon: Cross, overviewAccent: "emerald" },
  [APP_MODULE.WATCHLIST]: { icon: Clapperboard, overviewAccent: "indigo" },
  [APP_MODULE.RESTAURANTS]: { icon: UtensilsCrossed, overviewAccent: "amber" },
  [APP_MODULE.PETS]: { icon: PawPrint, overviewAccent: "fuchsia" },
  [APP_MODULE.CHORES]: { icon: ListChecks, overviewAccent: "teal" },
  [APP_MODULE.NOTES]: { icon: StickyNote, overviewAccent: "lime" },
  [APP_MODULE.BIRTHDAYS]: { icon: Cake, overviewAccent: "rose" },
  [APP_MODULE.CALENDAR]: { icon: CalendarDays, overviewAccent: "sky" },
  [APP_MODULE.FAMILY_CALENDAR]: { icon: CalendarRange, overviewAccent: "sky" },
  [APP_MODULE.FAMILY]: { icon: Users, overviewAccent: "slate" },
};

export function isAppModuleId(value: string): value is AppModuleId {
  return (Object.values(APP_MODULE) as readonly string[]).includes(value);
}

export function normalizeAppModuleId(value: string): AppModuleId | null {
  if (isAppModuleId(value)) return value;
  return LEGACY_MODULE_ID_MAP[value] ?? null;
}

export function getAppModuleIcon(moduleId: AppModuleId): LucideIcon {
  return MODULE_META[moduleId].icon;
}

export function getAppModuleOverviewMeta(moduleId: AppModuleId): AppModuleMeta {
  return MODULE_META[moduleId];
}

export function getFamilyModuleRoute(): string {
  return "/family";
}

export function getAppModuleRoute(moduleId: AppModuleId): string {
  if (moduleId === APP_MODULE.FAMILY) {
    return getFamilyModuleRoute();
  }
  return APP_MODULE_ROUTES[moduleId];
}

export function getAppModuleLabel(
  moduleId: AppModuleId,
  labels: Dict["dashboard"]["moduleLabels"]
): string {
  return labels[moduleId];
}

export function getAppModuleDesc(
  moduleId: AppModuleId,
  descs: Dict["dashboard"]["moduleDescs"]
): string {
  return descs[moduleId];
}
