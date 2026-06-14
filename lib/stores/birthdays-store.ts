import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { BirthdayEntry } from "@/lib/birthdays/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

interface BirthdaysStore {
  entries: BirthdayEntry[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchEntries: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  entries: [] as BirthdayEntry[],
  ...listFetchInitial,
};

export const useBirthdaysStore = create<BirthdaysStore>((set, get) => ({
  ...initialState,

  fetchEntries: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("birthdays:list", async () => {
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();
          return supabase
            .from("birthday_entries")
            .select("*")
            .order("birth_month")
            .order("birth_day");
        },
        apply: (data) => set({ entries: (data ?? []) as BirthdayEntry[] }),
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
