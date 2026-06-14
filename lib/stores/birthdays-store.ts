import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { BirthdayEntry } from "@/lib/birthdays/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface BirthdaysStore {
  entries: BirthdayEntry[];
  loaded: boolean;
  loading: boolean;
  fetchEntries: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  entries: [] as BirthdayEntry[],
  loaded: false,
  loading: false,
};

export const useBirthdaysStore = create<BirthdaysStore>((set, get) => ({
  ...initialState,

  fetchEntries: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("birthdays:list", async () => {
      set({ loading: true });
      const supabase = createClient();
      const { data } = await supabase
        .from("birthday_entries")
        .select("*")
        .order("birth_month")
        .order("birth_day");

      set({
        entries: (data ?? []) as BirthdayEntry[],
        loaded: true,
        loading: false,
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
