import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { WatchlistItem } from "@/lib/watchlist/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface WatchlistStore {
  items: WatchlistItem[];
  loaded: boolean;
  loading: boolean;
  fetchItems: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  items: [] as WatchlistItem[],
  loaded: false,
  loading: false,
};

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  ...initialState,

  fetchItems: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("watchlist:list", async () => {
      set({ loading: true });

      const supabase = createClient();
      const { data } = await supabase
        .from("watchlist_items")
        .select("*")
        .order("updated_at", { ascending: false });

      set({
        items: (data ?? []) as WatchlistItem[],
        loaded: true,
        loading: false,
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
