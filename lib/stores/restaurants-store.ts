import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface RestaurantsStore {
  places: RestaurantPlace[];
  loaded: boolean;
  loading: boolean;
  fetchPlaces: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  places: [] as RestaurantPlace[],
  loaded: false,
  loading: false,
};

export const useRestaurantsStore = create<RestaurantsStore>((set, get) => ({
  ...initialState,

  fetchPlaces: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("restaurants:list", async () => {
      set({ loading: true });

      const supabase = createClient();
      const { data } = await supabase
        .from("restaurant_places")
        .select("*")
        .order("updated_at", { ascending: false });

      set({
        places: (data ?? []) as RestaurantPlace[],
        loaded: true,
        loading: false,
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
