import type { Budget, BudgetExpense } from "@/lib/budget/types";
import type { BirthdayEntry } from "@/lib/birthdays/types";
import type { ChoreTask } from "@/lib/chores/types";
import type { GiftIdea } from "@/lib/gifts/types";
import type { MedicineItem } from "@/lib/medicine/types";
import type { Note, NoteCategory } from "@/lib/notes/types";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import type { Profile, FamilyMember } from "@/lib/profile";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import type { ScheduleEntry } from "@/lib/schedule/types";
import type { ShoppingList, ShoppingListItem } from "@/lib/shopping-lists/types";
import type { WatchlistItem } from "@/lib/watchlist/types";
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

export interface SearchStoresSnapshot {
  profile: Profile | null;
  members: FamilyMember[];
  budgets: Budget[];
  expensesByBudgetId: Record<string, BudgetExpense[]>;
  shoppingLists: ShoppingList[];
  itemsByListId: Record<string, ShoppingListItem[]>;
  gifts: GiftIdea[];
  birthdays: BirthdayEntry[];
  scheduleEntries: ScheduleEntry[];
  medicineItems: MedicineItem[];
  watchlistItems: WatchlistItem[];
  restaurants: RestaurantPlace[];
  pets: Pet[];
  petCareItems: PetCareItem[];
  chores: ChoreTask[];
  notes: Note[];
  noteCategories: NoteCategory[];
}

export function readSearchStoresSnapshot(): SearchStoresSnapshot {
  const profileState = useProfileStore.getState();
  const budgetState = useBudgetStore.getState();
  const shoppingState = useShoppingListsStore.getState();
  const petsState = usePetsStore.getState();
  const notesState = useNotesStore.getState();

  return {
    profile: profileState.profile,
    members: profileState.members,
    budgets: budgetState.budgets,
    expensesByBudgetId: budgetState.expensesByBudgetId,
    shoppingLists: shoppingState.lists,
    itemsByListId: shoppingState.itemsByListId,
    gifts: useGiftsStore.getState().ideas,
    birthdays: useBirthdaysStore.getState().entries,
    scheduleEntries: useScheduleStore.getState().entries,
    medicineItems: useMedicineStore.getState().items,
    watchlistItems: useWatchlistStore.getState().items,
    restaurants: useRestaurantsStore.getState().places,
    pets: petsState.pets,
    petCareItems: petsState.careItems,
    chores: useChoresStore.getState().tasks,
    notes: notesState.notes,
    noteCategories: notesState.categories,
  };
}
