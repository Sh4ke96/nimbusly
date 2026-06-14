import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { MedicineItem } from "@/lib/medicine/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface MedicineStore {
  items: MedicineItem[];
  loaded: boolean;
  loading: boolean;
  fetchItems: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  items: [] as MedicineItem[],
  loaded: false,
  loading: false,
};

export const useMedicineStore = create<MedicineStore>((set, get) => ({
  ...initialState,

  fetchItems: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("medicine:list", async () => {
      set({ loading: true });

      const supabase = createClient();
      const { data } = await supabase
        .from("medicine_items")
        .select("*")
        .order("updated_at", { ascending: false });

      set({
        items: (data ?? []) as MedicineItem[],
        loaded: true,
        loading: false,
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
