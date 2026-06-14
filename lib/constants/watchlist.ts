export const WATCHLIST_MEDIA_TYPE = {
  MOVIE: "movie",
  SERIES: "series",
} as const;

export const WATCHLIST_MEDIA_TYPES = [
  WATCHLIST_MEDIA_TYPE.MOVIE,
  WATCHLIST_MEDIA_TYPE.SERIES,
] as const;

export type WatchlistMediaType = (typeof WATCHLIST_MEDIA_TYPES)[number];

export const WATCHLIST_STATUS = {
  TO_WATCH: "to_watch",
  WATCHING: "watching",
  WATCHED: "watched",
} as const;

export const WATCHLIST_STATUSES = [
  WATCHLIST_STATUS.TO_WATCH,
  WATCHLIST_STATUS.WATCHING,
  WATCHLIST_STATUS.WATCHED,
] as const;

export type WatchlistStatus = (typeof WATCHLIST_STATUSES)[number];

export const WATCHLIST_FILTER_ALL = "all";

export const WATCHLIST_TITLE_MAX_LENGTH = 200;
export const WATCHLIST_NOTES_MAX_LENGTH = 500;
