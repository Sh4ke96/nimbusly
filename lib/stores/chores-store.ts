import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { ChoreTask } from "@/lib/chores/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface ChoresStore {
  tasks: ChoreTask[];
  loaded: boolean;
  loading: boolean;
  fetchTasks: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  tasks: [] as ChoreTask[],
  loaded: false,
  loading: false,
};

export const useChoresStore = create<ChoresStore>((set, get) => ({
  ...initialState,

  fetchTasks: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("chores:list", async () => {
      set({ loading: true });
      const supabase = createClient();
      const { data } = await supabase
        .from("chore_tasks")
        .select("*")
        .order("updated_at", { ascending: false });

      set({
        tasks: (data ?? []) as ChoreTask[],
        loaded: true,
        loading: false,
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
