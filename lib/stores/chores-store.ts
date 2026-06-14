import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { ChoreTask } from "@/lib/chores/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

interface ChoresStore {
  tasks: ChoreTask[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchTasks: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  tasks: [] as ChoreTask[],
  ...listFetchInitial,
};

export const useChoresStore = create<ChoresStore>((set, get) => ({
  ...initialState,

  fetchTasks: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("chores:list", async () => {
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();
          return supabase
            .from("chore_tasks")
            .select("*")
            .order("updated_at", { ascending: false });
        },
        apply: (data) => set({ tasks: (data ?? []) as ChoreTask[] }),
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
