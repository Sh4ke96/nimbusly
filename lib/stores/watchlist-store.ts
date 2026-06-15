import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { watchlistItemFromRow } from "@/lib/supabase/app-rows";
import type { WatchlistItem } from "@/lib/watchlist/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

interface WatchlistStore {
  items: WatchlistItem[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchItems: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  items: [] as WatchlistItem[],
  ...listFetchInitial,
};

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  ...initialState,

  fetchItems: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("watchlist:list", async () => {
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();
          return supabase
            .from("watchlist_items")
            .select("*")
            .order("updated_at", { ascending: false });
        },
        apply: (data) => set({ items: (data ?? []).map(watchlistItemFromRow) }),
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
