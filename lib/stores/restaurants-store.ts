import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

interface RestaurantsStore {
  places: RestaurantPlace[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchPlaces: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  places: [] as RestaurantPlace[],
  ...listFetchInitial,
};

export const useRestaurantsStore = create<RestaurantsStore>((set, get) => ({
  ...initialState,

  fetchPlaces: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("restaurants:list", async () => {
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();
          return supabase
            .from("restaurant_places")
            .select("*")
            .order("updated_at", { ascending: false });
        },
        apply: (data) => set({ places: (data ?? []) as RestaurantPlace[] }),
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
