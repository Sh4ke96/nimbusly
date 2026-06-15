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

async function prefetchShoppingListItems(): Promise<void> {
  const store = useShoppingListsStore.getState();
  await store.fetchLists();
  const lists = useShoppingListsStore.getState().lists;
  await Promise.all(lists.map((list) => store.fetchItems(list.id)));
}

/** Loads all module stores used by global search (idempotent). */
export async function prefetchSearchStores(): Promise<void> {
  await Promise.all([
    useProfileStore.getState().fetchSession(),
    useBudgetStore.getState().fetchBudgets(),
    prefetchShoppingListItems(),
    useGiftsStore.getState().fetchIdeas(),
    useBirthdaysStore.getState().fetchEntries(),
    useScheduleStore.getState().fetchEntries(),
    useMedicineStore.getState().fetchItems(),
    useWatchlistStore.getState().fetchItems(),
    useRestaurantsStore.getState().fetchPlaces(),
    usePetsStore.getState().fetchAll(),
    useChoresStore.getState().fetchTasks(),
    useNotesStore.getState().fetchNotes(),
  ]);
}
