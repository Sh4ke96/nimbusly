import {
  WATCHLIST_MEDIA_TYPES,
  WATCHLIST_NOTES_MAX_LENGTH,
  WATCHLIST_STATUSES,
  WATCHLIST_TITLE_MAX_LENGTH,
  type WatchlistMediaType,
  type WatchlistStatus,
} from "@/lib/constants/watchlist";
import type { StreamingPlatform } from "@/lib/constants/watchlist-streaming";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import { getFormString, getFormTrimmedString } from "@/lib/form/values";
import { parseStreamingPlatformsJson } from "@/lib/watchlist/streaming-platforms";

export interface WatchlistItem {
  id: string;
  family_id: string | null;
  title: string;
  media_type: WatchlistMediaType;
  status: WatchlistStatus;
  notes: string;
  streaming_platforms: StreamingPlatform[];
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

export const WATCHLIST_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  TITLE: "title",
  MEDIA_TYPE: "mediaType",
  STATUS: "status",
  NOTES: "notes",
  STREAMING_PLATFORMS: "streamingPlatforms",
} as const;

export function parseWatchlistIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, WATCHLIST_FORM_FIELD.ID);
}

export function parseWatchlistStatusFromForm(formData: FormData): {
  id: string;
  status: string;
} {
  return {
    id: getFormTrimmedString(formData, WATCHLIST_FORM_FIELD.ID),
    status: getFormTrimmedString(formData, WATCHLIST_FORM_FIELD.STATUS),
  };
}

export function parseWatchlistItemFromForm(formData: FormData): {
  title: string;
  mediaType: WatchlistMediaType | null;
  status: WatchlistStatus | null;
  notes: string;
  streamingPlatforms: StreamingPlatform[] | null;
} {
  const title = normalizeWatchlistTitle(getFormString(formData, WATCHLIST_FORM_FIELD.TITLE));
  const mediaTypeRaw = getFormTrimmedString(formData, WATCHLIST_FORM_FIELD.MEDIA_TYPE);
  const statusRaw = getFormTrimmedString(formData, WATCHLIST_FORM_FIELD.STATUS);
  const notes = getFormTrimmedString(formData, WATCHLIST_FORM_FIELD.NOTES);
  const streamingPlatformsRaw = getFormString(
    formData,
    WATCHLIST_FORM_FIELD.STREAMING_PLATFORMS
  );
  const streamingPlatforms = parseStreamingPlatformsJson(streamingPlatformsRaw);

  return {
    title,
    mediaType: isValidWatchlistMediaType(mediaTypeRaw) ? mediaTypeRaw : null,
    status: isValidWatchlistStatus(statusRaw) ? statusRaw : null,
    notes,
    streamingPlatforms,
  };
}
