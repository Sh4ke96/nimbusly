import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
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
import { useShoppingCategoriesStore } from "@/lib/stores/shopping-categories-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";
import { clearDedupeAsync } from "@/lib/stores/dedupe-async";

export function resetAllClientStores() {
  clearDedupeAsync();
  useProfileStore.getState().reset();
  useNotificationsStore.getState().reset();
  useGiftsStore.getState().reset();
  useMedicineStore.getState().reset();
  useWatchlistStore.getState().reset();
  useRestaurantsStore.getState().reset();
  usePetsStore.getState().reset();
  useChoresStore.getState().reset();
  useShoppingListsStore.getState().reset();
  useShoppingCategoriesStore.getState().reset();
  useBudgetStore.getState().reset();
  useScheduleStore.getState().reset();
  useBirthdaysStore.getState().reset();
  useNotesStore.getState().reset();
  useNimbusStore.setState({
    menuOpen: false,
    menuView: "main",
    tourActive: false,
    activeTourId: null,
    tourStepIndex: 0,
    hintIndex: null,
    hintMessage: null,
    hintKind: null,
    hintAction: null,
    npcCalling: false,
  });
}
