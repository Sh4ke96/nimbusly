import { LOCALE_BY_LANG } from "@/lib/constants/lang";
import type { Lang } from "@/lib/constants/lang";
import { resolveGiftRecipientLabel } from "@/lib/gifts/recipients";
import type { Dict } from "@/lib/i18n/types";
import { buildSearchIndex, type SearchIndexInput } from "@/lib/search/global-search";
import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { useBudgetStore } from "@/lib/stores/budget-store";
import { useChoresStore } from "@/lib/stores/chores-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";
import { useMedicineStore } from "@/lib/stores/medicine-store";
import { usePetsStore } from "@/lib/stores/pets-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useRestaurantsStore } from "@/lib/stores/restaurants-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { useWatchlistStore } from "@/lib/stores/watchlist-store";

export function collectSearchIndexInput(
  moduleLabels: Dict["dashboard"]["moduleLabels"],
  lang: Lang
): SearchIndexInput {
  const locale = LOCALE_BY_LANG[lang];
  const members = useProfileStore.getState().members;
  const shoppingState = useShoppingListsStore.getState();
  const listNameById = Object.fromEntries(
    shoppingState.lists.map((list) => [list.id, list.name])
  );

  return {
    moduleLabels,
    budgets: useBudgetStore.getState().budgets.map((budget) => ({
      id: budget.id,
      name: budget.name,
    })),
    shoppingLists: shoppingState.lists.map((list) => ({
      id: list.id,
      name: list.name,
    })),
    shoppingItems: Object.entries(shoppingState.itemsByListId).flatMap(([listId, items]) =>
      items.map((item) => ({
        id: item.id,
        listId,
        content: item.content,
        listName: listNameById[listId] ?? "",
      }))
    ),
    gifts: useGiftsStore.getState().ideas.map((idea) => ({
      id: idea.id,
      content: idea.content,
      recipientLabel: resolveGiftRecipientLabel(idea, members),
    })),
    birthdays: useBirthdaysStore.getState().entries.map((entry) => ({
      id: entry.id,
      personName: entry.person_name,
    })),
    scheduleEntries: useScheduleStore.getState().entries.map((entry) => ({
      id: entry.id,
      title: entry.description,
      dateLabel: new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(entry.entry_date)),
    })),
    medicineItems: useMedicineStore.getState().items.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    watchlistItems: useWatchlistStore.getState().items.map((item) => ({
      id: item.id,
      title: item.title,
    })),
    restaurants: useRestaurantsStore.getState().places.map((place) => ({
      id: place.id,
      name: place.name,
    })),
    pets: usePetsStore.getState().pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
    })),
    chores: useChoresStore.getState().tasks.map((task) => ({
      id: task.id,
      title: task.title,
    })),
  };
}

export function collectSearchIndex(moduleLabels: Dict["dashboard"]["moduleLabels"], lang: Lang) {
  return buildSearchIndex(collectSearchIndexInput(moduleLabels, lang));
}
