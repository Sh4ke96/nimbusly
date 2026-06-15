import { buildAttentionItems } from "@/lib/dashboard/attention";
import type { SearchStoresSnapshot } from "@/lib/search/search-stores-snapshot";
import type { Dict } from "@/lib/i18n/types";

export function countAttentionFromSnapshot(
  snapshot: SearchStoresSnapshot,
  t: Dict
): number {
  const expenses = Object.values(snapshot.expensesByBudgetId).flat();
  const items = buildAttentionItems({
    choreTasks: snapshot.chores,
    medicineItems: snapshot.medicineItems,
    careItems: snapshot.petCareItems,
    pets: snapshot.pets,
    birthdays: snapshot.birthdays,
    budgetExpenses: expenses,
    scheduleEntries: snapshot.scheduleEntries,
    notes: snapshot.notes,
    labels: {
      choreOverdue: (title) => title,
      medicineExpiring: (name) => name,
      petCareDue: (pet, item) => `${pet} ${item}`,
      birthdaySoon: (name, when) => `${name} (${when})`,
      birthdayToday: t.dashboard.birthdayToday,
      birthdayInDays: (count) => count,
      budgetPaymentDue: (description) => description,
      scheduleEnding: (description) => description,
      noteUrgent: (title) => title,
    },
    limit: 99,
  });
  return items.length;
}
