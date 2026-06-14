import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial } from "@/lib/stores/list-fetch";

interface PetsStore {
  pets: Pet[];
  careItems: PetCareItem[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchAll: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  pets: [] as Pet[],
  careItems: [] as PetCareItem[],
  ...listFetchInitial,
};

export const usePetsStore = create<PetsStore>((set, get) => ({
  ...initialState,

  fetchAll: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("pets:all", async () => {
      set({ loading: true, error: false });
      try {
        const supabase = createClient();
        const [petsResult, careResult] = await Promise.all([
          supabase.from("pets").select("*").order("name"),
          supabase
            .from("pet_care_items")
            .select("*")
            .order("updated_at", { ascending: false }),
        ]);

        if (petsResult.error || careResult.error) {
          set({ loading: false, loaded: true, error: true });
          return;
        }

        set({
          pets: (petsResult.data ?? []) as Pet[],
          careItems: (careResult.data ?? []) as PetCareItem[],
          loaded: true,
          loading: false,
          error: false,
        });
      } catch {
        set({ loading: false, loaded: true, error: true });
      }
    });
  },

  reset: () => set({ ...initialState }),
}));
