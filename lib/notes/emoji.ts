import { NOTE_ICON_EMOJI_MAX_LENGTH } from "@/lib/constants/notes";

export function normalizeNoteIconEmoji(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const first = [...segmenter.segment(trimmed)][0]?.segment;
    return first && first.length <= NOTE_ICON_EMOJI_MAX_LENGTH ? first : null;
  }

  return trimmed.length <= NOTE_ICON_EMOJI_MAX_LENGTH ? trimmed : null;
}

export function isValidNoteIconEmoji(value: string | null | undefined): boolean {
  if (!value) return true;
  return normalizeNoteIconEmoji(value) !== null;
}
