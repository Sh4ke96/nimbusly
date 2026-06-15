import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  readSearchStoresSnapshot,
  type SearchStoresSnapshot,
} from "@/lib/search/search-stores-snapshot";
import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { useBudgetStore } from "@/lib/stores/budget-store";
import { useChoresStore } from "@/lib/stores/chores-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";
import { useMedicineStore } from "@/lib/stores/medicine-store";
import { useNotesStore } from "@/lib/stores/notes-store";
import { usePetsStore } from "@/lib/stores/pets-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useRestaurantsStore } from "@/lib/stores/restaurants-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";

export function useSearchStoresSnapshot(): SearchStoresSnapshot {
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const budgets = useBudgetStore((s) => s.budgets);
  const expensesByBudgetId = useBudgetStore((s) => s.expensesByBudgetId);
  const shoppingLists = useShoppingListsStore((s) => s.lists);
  const itemsByListId = useShoppingListsStore((s) => s.itemsByListId);
  const gifts = useGiftsStore((s) => s.ideas);
  const birthdays = useBirthdaysStore((s) => s.entries);
  const scheduleEntries = useScheduleStore((s) => s.entries);
  const medicineItems = useMedicineStore((s) => s.items);
  const watchlistItems = useWatchlistStore((s) => s.items);
  const restaurants = useRestaurantsStore((s) => s.places);
  const { pets, petCareItems } = usePetsStore(
    useShallow((s) => ({ pets: s.pets, petCareItems: s.careItems }))
  );
  const chores = useChoresStore((s) => s.tasks);
  const { notes, categories: noteCategories } = useNotesStore(
    useShallow((s) => ({ notes: s.notes, categories: s.categories }))
  );

  return useMemo(
    () =>
      readSearchStoresSnapshot(),
    [
      profile,
      members,
      budgets,
      expensesByBudgetId,
      shoppingLists,
      itemsByListId,
      gifts,
      birthdays,
      scheduleEntries,
      medicineItems,
      watchlistItems,
      restaurants,
      pets,
      petCareItems,
      chores,
      notes,
      noteCategories,
    ]
  );
}
