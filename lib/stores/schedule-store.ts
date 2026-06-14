import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { ScheduleEntry } from "@/lib/schedule/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface ScheduleStore {
  entries: ScheduleEntry[];
  loaded: boolean;
  loading: boolean;
  fetchEntries: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  entries: [] as ScheduleEntry[],
  loaded: false,
  loading: false,
};

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  ...initialState,

  fetchEntries: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("schedule:list", async () => {
      set({ loading: true });

      const supabase = createClient();
      const { data } = await supabase
        .from("schedule_entries")
        .select("*")
        .order("entry_date");

      set({
        entries: (data ?? []) as ScheduleEntry[],
        loaded: true,
        loading: false,
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
