import { create } from "zustand";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  sortShoppingListItems,
  type ShoppingList,
  type ShoppingListItem,
} from "@/lib/shopping-lists/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { compareNamesByProfileLang } from "@/lib/stores/sort-lang";
import { watchedListIdsFromRows } from "@/lib/shopping-lists/watches";

export const EMPTY_SHOPPING_LIST_ITEMS: ShoppingListItem[] = [];

export function selectShoppingListItems(
  listId: string
): (state: ShoppingListsStore) => ShoppingListItem[] {
  return (state) => state.itemsByListId[listId] ?? EMPTY_SHOPPING_LIST_ITEMS;
}

export function selectIsListWatched(
  listId: string
): (state: ShoppingListsStore) => boolean {
  return (state) => state.watchedListIds.includes(listId);
}

interface ShoppingListsStore {
  lists: ShoppingList[];
  itemsByListId: Record<string, ShoppingListItem[]>;
  loaded: boolean;
  loading: boolean;
  itemsLoadingByListId: Record<string, boolean>;
  itemsErrorByListId: Record<string, boolean>;
  watchedListIds: string[];
  watchesLoaded: boolean;
  watchesError: boolean;
  error: boolean;
  fetchLists: (force?: boolean) => Promise<void>;
  fetchWatches: (force?: boolean) => Promise<void>;
  fetchItems: (listId: string, force?: boolean) => Promise<void>;
  applyListChange: (
    payload: RealtimePostgresChangesPayload<ShoppingList>
  ) => void;
  applyItemChange: (
    listId: string,
    payload: RealtimePostgresChangesPayload<ShoppingListItem>
  ) => void;
  setItemsForList: (listId: string, items: ShoppingListItem[]) => void;
  reset: () => void;
}

const initialState = {
  lists: [] as ShoppingList[],
  itemsByListId: {} as Record<string, ShoppingListItem[]>,
  watchedListIds: [] as string[],
  loaded: false,
  watchesLoaded: false,
  loading: false,
  itemsLoadingByListId: {} as Record<string, boolean>,
  itemsErrorByListId: {} as Record<string, boolean>,
  error: false,
  watchesError: false,
};

function sortLists(lists: ShoppingList[]): ShoppingList[] {
  return [...lists].sort((a, b) => compareNamesByProfileLang(a.name, b.name));
}

export const useShoppingListsStore = create<ShoppingListsStore>((set, get) => ({
  ...initialState,

  fetchLists: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("shopping-lists:list", async () => {
      set({ loading: true, error: false });
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("shopping_lists")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) {
          set({ loading: false, loaded: true, error: true });
          return;
        }

        const lists = sortLists((data ?? []) as ShoppingList[]);
        set({
          lists,
          loaded: true,
          loading: false,
          error: false,
        });
      } catch {
        set({ loading: false, loaded: true, error: true });
      }
    });
  },

  fetchWatches: async (force = false) => {
    if (!force && get().watchesLoaded) return;

    return dedupeAsync("shopping-lists:watches", async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("shopping_list_watches")
        .select("list_id");

      if (error) {
        set({
          watchedListIds: [],
          watchesLoaded: true,
          watchesError: true,
        });
        return;
      }

      set({
        watchedListIds: watchedListIdsFromRows(
          (data ?? []) as { list_id: string }[]
        ),
        watchesLoaded: true,
        watchesError: false,
      });
    });
  },

  fetchItems: async (listId, force = false) => {
    const loading = get().itemsLoadingByListId[listId];
    const hasItems = listId in get().itemsByListId;
    const hasError = get().itemsErrorByListId[listId];
    if (!force && hasItems && !loading && !hasError) return;

    return dedupeAsync(`shopping-lists:items:${listId}`, async () => {
      set((state) => ({
        itemsLoadingByListId: { ...state.itemsLoadingByListId, [listId]: true },
        itemsErrorByListId: { ...state.itemsErrorByListId, [listId]: false },
      }));

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("shopping_list_items")
          .select("*")
          .eq("list_id", listId)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });

        if (error) {
          set((state) => ({
            itemsLoadingByListId: { ...state.itemsLoadingByListId, [listId]: false },
            itemsErrorByListId: { ...state.itemsErrorByListId, [listId]: true },
          }));
          return;
        }

        set((state) => ({
          itemsByListId: {
            ...state.itemsByListId,
            [listId]: sortShoppingListItems((data ?? []) as ShoppingListItem[]),
          },
          itemsLoadingByListId: {
            ...state.itemsLoadingByListId,
            [listId]: false,
          },
          itemsErrorByListId: {
            ...state.itemsErrorByListId,
            [listId]: false,
          },
        }));
      } catch {
        set((state) => ({
          itemsLoadingByListId: { ...state.itemsLoadingByListId, [listId]: false },
          itemsErrorByListId: { ...state.itemsErrorByListId, [listId]: true },
        }));
      }
    });
  },

  applyListChange: (payload) => {
    set((state) => {
      let lists = [...state.lists];

      if (payload.eventType === "INSERT" && payload.new) {
        if (!lists.some((list) => list.id === payload.new.id)) {
          lists.push(payload.new);
        }
      } else if (payload.eventType === "UPDATE" && payload.new) {
        lists = lists.map((list) =>
          list.id === payload.new.id ? payload.new : list
        );
      } else if (payload.eventType === "DELETE" && payload.old?.id) {
        const deletedId = payload.old.id;
        lists = lists.filter((list) => list.id !== deletedId);
        const restItems = { ...state.itemsByListId };
        delete restItems[deletedId];
        return {
          lists: sortLists(lists),
          itemsByListId: restItems,
        };
      }

      return { lists: sortLists(lists) };
    });
  },

  applyItemChange: (listId, payload) => {
    set((state) => {
      const current = state.itemsByListId[listId] ?? [];
      let items = [...current];

      if (payload.eventType === "INSERT" && payload.new) {
        if (!items.some((item) => item.id === payload.new.id)) {
          items.push(payload.new);
        }
      } else if (payload.eventType === "UPDATE" && payload.new) {
        items = items.map((item) =>
          item.id === payload.new.id ? payload.new : item
        );
      } else if (payload.eventType === "DELETE" && payload.old) {
        items = items.filter((item) => item.id !== payload.old.id);
      }

      return {
        itemsByListId: {
          ...state.itemsByListId,
          [listId]: sortShoppingListItems(items),
        },
      };
    });
  },

  setItemsForList: (listId, items) => {
    set((state) => ({
      itemsByListId: {
        ...state.itemsByListId,
        [listId]: sortShoppingListItems(items),
      },
    }));
  },

  reset: () => set({ ...initialState }),
}));
