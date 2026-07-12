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
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";

/** Loads module list stores used by global search (skips shopping item bodies). */
export async function prefetchSearchListStores(): Promise<void> {
  const profileLoaded = useProfileStore.getState().loaded;
  await Promise.all([
    profileLoaded ? Promise.resolve() : useProfileStore.getState().fetchSession(),
    useBudgetStore.getState().fetchBudgets(),
    useShoppingListsStore.getState().fetchLists(),
    useShoppingCategoriesStore.getState().fetchCategories(),
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

/** Fetches shopping list items only for lists not already cached. */
export async function prefetchSearchShoppingItems(): Promise<void> {
  const store = useShoppingListsStore.getState();
  if (!store.loaded) {
    await store.fetchLists();
  }

  const lists = useShoppingListsStore.getState().lists;
  const cached = useShoppingListsStore.getState().itemsByListId;

  await Promise.all(
    lists
      .filter((list) => !(list.id in cached))
      .map((list) => store.fetchItems(list.id))
  );
}

/** @deprecated Use prefetchSearchListStores + prefetchSearchShoppingItems */
export async function prefetchSearchStores(): Promise<void> {
  await prefetchSearchListStores();
  await prefetchSearchShoppingItems();
}
