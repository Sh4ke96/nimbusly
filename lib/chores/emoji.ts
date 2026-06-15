import { CHORE_ICON_EMOJI_MAX_LENGTH } from "@/lib/constants/chores";

export function normalizeChoreIconEmoji(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const first = [...segmenter.segment(trimmed)][0]?.segment;
    return first && first.length <= CHORE_ICON_EMOJI_MAX_LENGTH ? first : null;
  }

  return trimmed.length <= CHORE_ICON_EMOJI_MAX_LENGTH ? trimmed : null;
}

export function isValidChoreIconEmoji(value: string | null | undefined): boolean {
  if (!value) return true;
  return normalizeChoreIconEmoji(value) !== null;
}
