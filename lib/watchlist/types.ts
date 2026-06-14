import {
  WATCHLIST_MEDIA_TYPES,
  WATCHLIST_NOTES_MAX_LENGTH,
  WATCHLIST_STATUSES,
  WATCHLIST_TITLE_MAX_LENGTH,
  type WatchlistMediaType,
  type WatchlistStatus,
} from "@/lib/constants/watchlist";

export interface WatchlistItem {
  id: string;
  family_id: string | null;
  title: string;
  media_type: WatchlistMediaType;
  status: WatchlistStatus;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function normalizeWatchlistTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ");
}

export function isValidWatchlistTitle(title: string): boolean {
  const normalized = normalizeWatchlistTitle(title);
  return normalized.length > 0 && normalized.length <= WATCHLIST_TITLE_MAX_LENGTH;
}

export function isValidWatchlistMediaType(value: string): value is WatchlistMediaType {
  return WATCHLIST_MEDIA_TYPES.includes(value as WatchlistMediaType);
}

export function isValidWatchlistStatus(value: string): value is WatchlistStatus {
  return WATCHLIST_STATUSES.includes(value as WatchlistStatus);
}

export function isValidWatchlistNotes(notes: string): boolean {
  return notes.length <= WATCHLIST_NOTES_MAX_LENGTH;
}

export function parseWatchlistItemFromForm(formData: FormData): {
  title: string;
  mediaType: WatchlistMediaType | null;
  status: WatchlistStatus | null;
  notes: string;
} {
  const title = normalizeWatchlistTitle((formData.get("title") as string) ?? "");
  const mediaTypeRaw = (formData.get("mediaType") as string)?.trim() ?? "";
  const statusRaw = (formData.get("status") as string)?.trim() ?? "";
  const notes = ((formData.get("notes") as string) ?? "").trim();

  return {
    title,
    mediaType: isValidWatchlistMediaType(mediaTypeRaw) ? mediaTypeRaw : null,
    status: isValidWatchlistStatus(statusRaw) ? statusRaw : null,
    notes,
  };
}
