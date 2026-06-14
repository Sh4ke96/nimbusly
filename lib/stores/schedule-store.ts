import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { ScheduleEntry } from "@/lib/schedule/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

interface ScheduleStore {
  entries: ScheduleEntry[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchEntries: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  entries: [] as ScheduleEntry[],
  ...listFetchInitial,
};

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  ...initialState,

  fetchEntries: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("schedule:list", async () => {
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();
          return supabase
            .from("schedule_entries")
            .select("*")
            .order("entry_date");
        },
        apply: (data) => set({ entries: (data ?? []) as ScheduleEntry[] }),
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
