import type { SearchStoresSnapshot } from "@/lib/search/search-stores-snapshot";
import { isMedicineExpiringSoon } from "@/lib/medicine/expiry";

export const NIMBUS_SUGGESTION_ID = {
  BUDGET_NO_MEDICINE: "budgetNoMedicine",
  SHOPPING_NO_CHORES: "shoppingNoChores",
  FAMILY_NO_BIRTHDAYS: "familyNoBirthdays",
  PETS_NO_MEDICINE: "petsNoMedicine",
  SCHEDULE_NO_BIRTHDAYS: "scheduleNoBirthdays",
  GIFTS_NO_BIRTHDAYS: "giftsNoBirthdays",
  NOTES_NO_CHORES: "notesNoChores",
  BUDGET_NO_ENTRIES: "budgetNoEntries",
  WATCHLIST_EMPTY: "watchlistEmpty",
  MEDICINE_EXPIRING: "medicineExpiring",
  EMPTY_DASHBOARD: "emptyDashboard",
} as const;

export type NimbusSuggestionId =
  (typeof NIMBUS_SUGGESTION_ID)[keyof typeof NIMBUS_SUGGESTION_ID];

function hasBudgetEntries(snapshot: SearchStoresSnapshot): boolean {
  return Object.values(snapshot.expensesByBudgetId).some((entries) => entries.length > 0);
}

function hasExpiringMedicine(snapshot: SearchStoresSnapshot): boolean {
  return snapshot.medicineItems.some((item) => isMedicineExpiringSoon(item.expiry_date));
}

function isDashboardEmpty(snapshot: SearchStoresSnapshot): boolean {
  return (
    snapshot.budgets.length === 0 &&
    snapshot.shoppingLists.length === 0 &&
    snapshot.chores.length === 0 &&
    snapshot.notes.length === 0 &&
    snapshot.birthdays.length === 0 &&
    snapshot.scheduleEntries.length === 0
  );
}

export function detectNimbusSuggestions(
  snapshot: SearchStoresSnapshot,
  isFamily: boolean
): NimbusSuggestionId[] {
  const suggestions: NimbusSuggestionId[] = [];

  if (isDashboardEmpty(snapshot)) {
    suggestions.push(NIMBUS_SUGGESTION_ID.EMPTY_DASHBOARD);
  }

  if (snapshot.budgets.length > 0 && !hasBudgetEntries(snapshot)) {
    suggestions.push(NIMBUS_SUGGESTION_ID.BUDGET_NO_ENTRIES);
  }

  if (snapshot.budgets.length > 0 && snapshot.medicineItems.length === 0) {
    suggestions.push(NIMBUS_SUGGESTION_ID.BUDGET_NO_MEDICINE);
  }

  if (hasExpiringMedicine(snapshot)) {
    suggestions.push(NIMBUS_SUGGESTION_ID.MEDICINE_EXPIRING);
  }

  if (snapshot.shoppingLists.length > 0 && snapshot.chores.length === 0) {
    suggestions.push(NIMBUS_SUGGESTION_ID.SHOPPING_NO_CHORES);
  }

  if (isFamily && snapshot.birthdays.length === 0) {
    suggestions.push(NIMBUS_SUGGESTION_ID.FAMILY_NO_BIRTHDAYS);
  }

  if (snapshot.pets.length > 0 && snapshot.medicineItems.length === 0) {
    suggestions.push(NIMBUS_SUGGESTION_ID.PETS_NO_MEDICINE);
  }

  if (snapshot.scheduleEntries.length > 0 && snapshot.birthdays.length === 0) {
    suggestions.push(NIMBUS_SUGGESTION_ID.SCHEDULE_NO_BIRTHDAYS);
  }

  if (snapshot.gifts.length > 0 && snapshot.birthdays.length === 0) {
    suggestions.push(NIMBUS_SUGGESTION_ID.GIFTS_NO_BIRTHDAYS);
  }

  if (snapshot.notes.length > 0 && snapshot.chores.length === 0) {
    suggestions.push(NIMBUS_SUGGESTION_ID.NOTES_NO_CHORES);
  }

  if (snapshot.watchlistItems.length === 0 && !isDashboardEmpty(snapshot)) {
    suggestions.push(NIMBUS_SUGGESTION_ID.WATCHLIST_EMPTY);
  }

  return suggestions;
}
