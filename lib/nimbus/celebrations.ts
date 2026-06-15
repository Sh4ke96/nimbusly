const CELEBRATION_KEYS = {
  FIRST_CHORE: "nimbusly:celebrated-first-chore",
  FIRST_SHOPPING_LIST: "nimbusly:celebrated-first-shopping-list",
  FIRST_BUDGET: "nimbusly:celebrated-first-budget",
  FIRST_BUDGET_ENTRY: "nimbusly:celebrated-first-budget-entry",
  FIRST_URGENT_NOTE: "nimbusly:celebrated-first-urgent-note",
  FIRST_BIRTHDAY: "nimbusly:celebrated-first-birthday",
  FIRST_PET: "nimbusly:celebrated-first-pet",
  FIRST_SCHEDULE_ENTRY: "nimbusly:celebrated-first-schedule-entry",
  FIRST_GIFT: "nimbusly:celebrated-first-gift",
  FIRST_WATCHLIST_ITEM: "nimbusly:celebrated-first-watchlist-item",
  FIRST_FAMILY_INVITE: "nimbusly:celebrated-first-family-invite",
  FIRST_NOTIFICATION: "nimbusly:celebrated-first-notification",
} as const;

function hasCelebrated(key: string): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(key) === "1";
}

function markCelebrated(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, "1");
}

export type NimbusCelebrationId =
  | "firstChore"
  | "firstShoppingList"
  | "firstBudget"
  | "firstBudgetEntry"
  | "firstUrgentNote"
  | "firstBirthday"
  | "firstPet"
  | "firstScheduleEntry"
  | "firstGift"
  | "firstWatchlistItem"
  | "firstFamilyInvite"
  | "firstNotification";

const CELEBRATION_KEY_BY_ID: Record<NimbusCelebrationId, string> = {
  firstChore: CELEBRATION_KEYS.FIRST_CHORE,
  firstShoppingList: CELEBRATION_KEYS.FIRST_SHOPPING_LIST,
  firstBudget: CELEBRATION_KEYS.FIRST_BUDGET,
  firstBudgetEntry: CELEBRATION_KEYS.FIRST_BUDGET_ENTRY,
  firstUrgentNote: CELEBRATION_KEYS.FIRST_URGENT_NOTE,
  firstBirthday: CELEBRATION_KEYS.FIRST_BIRTHDAY,
  firstPet: CELEBRATION_KEYS.FIRST_PET,
  firstScheduleEntry: CELEBRATION_KEYS.FIRST_SCHEDULE_ENTRY,
  firstGift: CELEBRATION_KEYS.FIRST_GIFT,
  firstWatchlistItem: CELEBRATION_KEYS.FIRST_WATCHLIST_ITEM,
  firstFamilyInvite: CELEBRATION_KEYS.FIRST_FAMILY_INVITE,
  firstNotification: CELEBRATION_KEYS.FIRST_NOTIFICATION,
};

export function tryTriggerCelebration(id: NimbusCelebrationId): boolean {
  const key = CELEBRATION_KEY_BY_ID[id];
  if (hasCelebrated(key)) return false;
  markCelebrated(key);
  return true;
}
