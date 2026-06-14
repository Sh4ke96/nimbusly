import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { GiftIdea } from "@/lib/gifts/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

interface GiftsStore {
  ideas: GiftIdea[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchIdeas: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  ideas: [] as GiftIdea[],
  ...listFetchInitial,
};

export const useGiftsStore = create<GiftsStore>((set, get) => ({
  ...initialState,

  fetchIdeas: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("gifts:list", async () => {
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();
          return supabase
            .from("gift_ideas")
            .select("*")
            .order("updated_at", { ascending: false });
        },
        apply: (data) => set({ ideas: (data ?? []) as GiftIdea[] }),
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
