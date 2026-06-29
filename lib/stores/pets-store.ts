import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

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
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();
          const [petsResult, careResult] = await Promise.all([
            supabase.from("pets").select("*").order("name"),
            supabase
              .from("pet_care_items")
              .select("*")
              .order("updated_at", { ascending: false }),
          ]);

          if (petsResult.error) return { data: null, error: petsResult.error };
          if (careResult.error) return { data: null, error: careResult.error };

          return {
            data: {
              pets: (petsResult.data ?? []) as Pet[],
              careItems: (careResult.data ?? []) as PetCareItem[],
            },
            error: null,
          };
        },
        apply: (data) => {
          const payload = data as { pets: Pet[]; careItems: PetCareItem[] } | null;
          set({
            pets: payload?.pets ?? [],
            careItems: payload?.careItems ?? [],
          });
        },
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
