import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { useBudgetStore } from "@/lib/stores/budget-store";
import { useChoresStore } from "@/lib/stores/chores-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";
import { useMedicineStore } from "@/lib/stores/medicine-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { usePetsStore } from "@/lib/stores/pets-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useRestaurantsStore } from "@/lib/stores/restaurants-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";

export function resetAllClientStores() {
  useProfileStore.getState().reset();
  useNotificationsStore.getState().reset();
  useGiftsStore.getState().reset();
  useMedicineStore.getState().reset();
  useWatchlistStore.getState().reset();
  useRestaurantsStore.getState().reset();
  usePetsStore.getState().reset();
  useChoresStore.getState().reset();
  useShoppingListsStore.getState().reset();
  useBudgetStore.getState().reset();
  useScheduleStore.getState().reset();
  useBirthdaysStore.getState().reset();
}
