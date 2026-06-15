export const NIMBUS_CONTEXT_PATH = {
  BUDGET: "/budget",
  SHOPPING: "/shopping",
  CHORES: "/chores",
  NOTES: "/notes",
  MEDICINE: "/medicine-cabinet",
  DASHBOARD: "/dashboard",
  GIFTS: "/gifts",
  BIRTHDAYS: "/birthdays",
  SCHEDULE: "/schedule",
  WATCHLIST: "/watchlist",
  RESTAURANTS: "/restaurants",
  PETS: "/pets",
  NOTIFICATIONS: "/notifications",
} as const;

export type NimbusContextPath =
  (typeof NIMBUS_CONTEXT_PATH)[keyof typeof NIMBUS_CONTEXT_PATH];

const PATH_TO_CONTEXT = {
  [NIMBUS_CONTEXT_PATH.BUDGET]: "budget",
  [NIMBUS_CONTEXT_PATH.SHOPPING]: "shopping",
  [NIMBUS_CONTEXT_PATH.CHORES]: "chores",
  [NIMBUS_CONTEXT_PATH.NOTES]: "notes",
  [NIMBUS_CONTEXT_PATH.MEDICINE]: "medicine",
  [NIMBUS_CONTEXT_PATH.DASHBOARD]: "dashboard",
  [NIMBUS_CONTEXT_PATH.GIFTS]: "gifts",
  [NIMBUS_CONTEXT_PATH.BIRTHDAYS]: "birthdays",
  [NIMBUS_CONTEXT_PATH.SCHEDULE]: "schedule",
  [NIMBUS_CONTEXT_PATH.WATCHLIST]: "watchlist",
  [NIMBUS_CONTEXT_PATH.RESTAURANTS]: "restaurants",
  [NIMBUS_CONTEXT_PATH.PETS]: "pets",
  [NIMBUS_CONTEXT_PATH.NOTIFICATIONS]: "notifications",
} as const;

export type NimbusContextHintKey =
  (typeof PATH_TO_CONTEXT)[keyof typeof PATH_TO_CONTEXT];

export function getNimbusContextHintKey(pathname: string): NimbusContextHintKey | null {
  return (PATH_TO_CONTEXT as Record<string, NimbusContextHintKey | undefined>)[pathname] ?? null;
}
