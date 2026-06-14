import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface PetsStore {
  pets: Pet[];
  careItems: PetCareItem[];
  loaded: boolean;
  loading: boolean;
  fetchAll: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  pets: [] as Pet[],
  careItems: [] as PetCareItem[],
  loaded: false,
  loading: false,
};

export const usePetsStore = create<PetsStore>((set, get) => ({
  ...initialState,

  fetchAll: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("pets:all", async () => {
      set({ loading: true });
      const supabase = createClient();

      const [{ data: pets }, { data: careItems }] = await Promise.all([
        supabase.from("pets").select("*").order("name"),
        supabase.from("pet_care_items").select("*").order("updated_at", { ascending: false }),
      ]);

      set({
        pets: (pets ?? []) as Pet[],
        careItems: (careItems ?? []) as PetCareItem[],
        loaded: true,
        loading: false,
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
