import type { Dict } from "@/lib/i18n/types";

export const APP_MODULE_IDS = [
  "budget",
  "shopping",
  "gifts",
  "medicineCabinet",
  "watchlist",
  "restaurants",
  "pets",
  "chores",
  "birthdays",
  "calendar",
  "family",
] as const;

export type AppModuleId = (typeof APP_MODULE_IDS)[number];

export const APP_MODULE_ROUTES: Record<AppModuleId, string> = {
  budget: "/budget",
  shopping: "/shopping",
  gifts: "/gifts",
  medicineCabinet: "/medicine-cabinet",
  watchlist: "/watchlist",
  restaurants: "/restaurants",
  pets: "/pets",
  chores: "/chores",
  birthdays: "/birthdays",
  calendar: "/schedule",
  family: "/profile/settings",
};

export function getAppModuleLabel(
  moduleId: AppModuleId,
  labels: Dict["dashboard"]["moduleLabels"]
): string {
  return labels[moduleId];
}
