import {
  isValidWatchlistMediaType,
  isValidWatchlistNotes,
  isValidWatchlistStatus,
  isValidWatchlistTitle,
  parseWatchlistItemFromForm,
} from "@/lib/watchlist/types";

export function validateWatchlistFields(
  parsed: ReturnType<typeof parseWatchlistItemFromForm>
): string | null {
  if (!isValidWatchlistTitle(parsed.title)) return "title";
  if (!parsed.mediaType || !isValidWatchlistMediaType(parsed.mediaType)) return "mediaType";
  if (!parsed.status || !isValidWatchlistStatus(parsed.status)) return "status";
  if (!isValidWatchlistNotes(parsed.notes)) return "notes";
  if (parsed.streamingPlatforms === null) return "streamingPlatforms";
  return null;
}
