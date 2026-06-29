import type { DashboardSnapshot } from "@/lib/dashboard/snapshot-types";
import { watchlistItemFromRow } from "@/lib/supabase/app-rows";
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
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";

let hydratedForUserId: string | null = null;

export function resetHydratedDashboardSnapshot(): void {
  hydratedForUserId = null;
}

export function hydrateDashboardSnapshot(snapshot: DashboardSnapshot): void {
  if (hydratedForUserId === snapshot.user.id) {
    return;
  }
  hydratedForUserId = snapshot.user.id;

  useProfileStore.setState({
    user: snapshot.user,
    profile: snapshot.profile,
    family: snapshot.family,
    members: snapshot.members,
    invitations: snapshot.invitations,
    loaded: true,
    loading: false,
    error: false,
  });

  useBudgetStore.setState({
    budgets: snapshot.budgets,
    expensesByBudgetId: snapshot.expensesByBudgetId,
    memberIdsByBudgetId: snapshot.memberIdsByBudgetId,
    loaded: true,
    loading: false,
    error: false,
  });

  useShoppingListsStore.setState({
    lists: snapshot.shoppingLists,
    itemsByListId: snapshot.itemsByListId,
    loaded: true,
    loading: false,
    error: false,
  });

  useShoppingCategoriesStore.setState({
    categories: snapshot.shoppingCategories,
    loaded: true,
    loading: false,
    error: false,
  });

  useNotificationsStore.setState({
    items: snapshot.notifications,
    unreadCount: snapshot.notificationsUnreadCount,
    loaded: true,
    loading: false,
    error: false,
  });

  useGiftsStore.setState({
    ideas: snapshot.gifts,
    loaded: true,
    loading: false,
    error: false,
  });

  useMedicineStore.setState({
    items: snapshot.medicineItems,
    loaded: true,
    loading: false,
    error: false,
  });

  useWatchlistStore.setState({
    items: snapshot.watchlistItems.map(watchlistItemFromRow),
    loaded: true,
    loading: false,
    error: false,
  });

  useRestaurantsStore.setState({
    places: snapshot.restaurantPlaces,
    loaded: true,
    loading: false,
    error: false,
  });

  usePetsStore.setState({
    pets: snapshot.pets,
    careItems: snapshot.petCareItems,
    loaded: true,
    loading: false,
    error: false,
  });

  useChoresStore.setState({
    tasks: snapshot.chores,
    loaded: true,
    loading: false,
    error: false,
  });

  useNotesStore.setState({
    notes: snapshot.notes,
    categories: snapshot.noteCategories,
    loaded: true,
    loading: false,
    error: false,
  });

  useScheduleStore.setState({
    entries: snapshot.scheduleEntries,
    loaded: true,
    loading: false,
    error: false,
  });

  useBirthdaysStore.setState({
    entries: snapshot.birthdays,
    loaded: true,
    loading: false,
    error: false,
  });
}
