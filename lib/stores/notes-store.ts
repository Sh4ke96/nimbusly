import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Note, NoteCategory } from "@/lib/notes/types";
import { sortNoteCategories, sortNotesByPinned } from "@/lib/notes/types";
import { dedupeAsync } from "@/lib/stores/dedupe-async";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

interface NotesStore {
  notes: Note[];
  categories: NoteCategory[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchNotes: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState = {
  notes: [] as Note[],
  categories: [] as NoteCategory[],
  ...listFetchInitial,
};

export const useNotesStore = create<NotesStore>((set, get) => ({
  ...initialState,

  fetchNotes: async (force = false) => {
    if (!force && get().loaded && !get().loading && !get().error) return;

    return dedupeAsync("notes:list", async () => {
      await runListFetch({
        set,
        query: async () => {
          const supabase = createClient();
          const [notesResult, categoriesResult] = await Promise.all([
            supabase.from("notes").select("*").order("is_pinned", { ascending: false }).order("updated_at", { ascending: false }),
            supabase.from("note_categories").select("*").order("sort_order"),
          ]);

          if (notesResult.error) return { data: null, error: notesResult.error };
          if (categoriesResult.error) return { data: null, error: categoriesResult.error };

          return {
            data: {
              notes: (notesResult.data ?? []) as Note[],
              categories: sortNoteCategories((categoriesResult.data ?? []) as NoteCategory[]),
            },
            error: null,
          };
        },
        apply: (data) => {
          const payload = data as { notes: Note[]; categories: NoteCategory[] } | null;
          set({
            notes: sortNotesByPinned(payload?.notes ?? []),
            categories: payload?.categories ?? [],
          });
        },
      });
    });
  },

  reset: () => set({ ...initialState }),
}));
