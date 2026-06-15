import { NOTE_ATTENTION_TITLE_PREFIX } from "@/lib/constants/notes";
import type { Note } from "@/lib/notes/types";

export function isNoteMarkedUrgent(note: Pick<Note, "title">): boolean {
  return note.title.trimStart().startsWith(NOTE_ATTENTION_TITLE_PREFIX);
}

export function formatUrgentNoteTitle(title: string): string {
  return title.trimStart().slice(NOTE_ATTENTION_TITLE_PREFIX.length).trimStart() || title.trim();
}
