import { create } from "zustand";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  sortShoppingListCategories,
  type ShoppingListCategory,
} from "@/lib/shopping-lists/categories";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface ShoppingCategoriesStore {
  categories: ShoppingListCategory[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchCategories: (force?: boolean) => Promise<void>;
  applyCategoryChange: (
    payload: RealtimePostgresChangesPayload<ShoppingListCategory>
  ) => void;
  setCategories: (categories: ShoppingListCategory[]) => void;
  reset: () => void;
}

const initialState = {
  categories: [] as ShoppingListCategory[],
  loaded: false,
  loading: false,
  error: false,
};

export const useShoppingCategoriesStore = create<ShoppingCategoriesStore>(
  (set, get) => ({
    ...initialState,

    fetchCategories: async (force = false) => {
      if (!force && get().loaded && !get().loading && !get().error) return;

      return dedupeAsync("shopping-categories:list", async () => {
        set({ loading: true, error: false });
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("shopping_list_categories")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true });

          if (error) {
            set({ loading: false, loaded: true, error: true });
            return;
          }

          set({
            categories: sortShoppingListCategories(
              (data ?? []) as ShoppingListCategory[]
            ),
            loaded: true,
            loading: false,
            error: false,
          });
        } catch {
          set({ loading: false, loaded: true, error: true });
        }
      });
    },

    applyCategoryChange: (payload) => {
      set((state) => {
        let categories = [...state.categories];

        if (payload.eventType === "INSERT" && payload.new) {
          if (!categories.some((category) => category.id === payload.new.id)) {
            categories.push(payload.new);
          }
        } else if (payload.eventType === "UPDATE" && payload.new) {
          categories = categories.map((category) =>
            category.id === payload.new.id ? payload.new : category
          );
        } else if (payload.eventType === "DELETE" && payload.old?.id) {
          categories = categories.filter(
            (category) => category.id !== payload.old.id
          );
        }

        return { categories: sortShoppingListCategories(categories) };
      });
    },

    setCategories: (categories) => {
      set({ categories: sortShoppingListCategories(categories) });
    },

    reset: () => set({ ...initialState }),
  })
);
