import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { GiftIdea } from "@/lib/gifts/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface GiftsStore {
  ideas: GiftIdea[];
  loaded: boolean;
  loading: boolean;
  fetchIdeas: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  ideas: [] as GiftIdea[],
  loaded: false,
  loading: false,
};

export const useGiftsStore = create<GiftsStore>((set, get) => ({
  ...initialState,

  fetchIdeas: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("gifts:list", async () => {
      set({ loading: true });

      const supabase = createClient();
      const { data } = await supabase
        .from("gift_ideas")
        .select("*")
        .order("updated_at", { ascending: false });

      set({
        ideas: (data ?? []) as GiftIdea[],
        loaded: true,
        loading: false,
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
