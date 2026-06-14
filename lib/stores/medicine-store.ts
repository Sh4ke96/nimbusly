import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { MedicineItem } from "@/lib/medicine/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

interface MedicineStore {
  items: MedicineItem[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchItems: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  items: [] as MedicineItem[],
  ...listFetchInitial,
};

export const useMedicineStore = create<MedicineStore>((set, get) => ({
  ...initialState,

  fetchItems: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("medicine:list", async () => {
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();
          return supabase
            .from("medicine_items")
            .select("*")
            .order("updated_at", { ascending: false });
        },
        apply: (data) => set({ items: (data ?? []) as MedicineItem[] }),
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
