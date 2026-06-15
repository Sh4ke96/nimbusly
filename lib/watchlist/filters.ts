import { WATCHLIST_FILTER_ALL } from "@/lib/constants/watchlist";
import type { WatchlistMediaType, WatchlistStatus } from "@/lib/constants/watchlist";
import {
  STREAMING_PLATFORMS,
  type StreamingPlatform,
} from "@/lib/constants/watchlist-streaming";
import type { WatchlistItem } from "@/lib/watchlist/types";

export function filterWatchlistByStatus(
  items: WatchlistItem[],
  filterKey: string
): WatchlistItem[] {
  if (filterKey === WATCHLIST_FILTER_ALL) return items;
  return items.filter((item) => item.status === filterKey);
}

export function filterWatchlistByMediaType(
  items: WatchlistItem[],
  filterKey: string
): WatchlistItem[] {
  if (filterKey === WATCHLIST_FILTER_ALL) return items;
  return items.filter((item) => item.media_type === filterKey);
}

export function filterWatchlistByStreamingPlatform(
  items: WatchlistItem[],
  filterKey: string
): WatchlistItem[] {
  if (filterKey === WATCHLIST_FILTER_ALL) return items;
  return items.filter((item) =>
    item.streaming_platforms.includes(filterKey as StreamingPlatform)
  );
}

export function countWatchlistByStatus(
  items: WatchlistItem[]
): Record<WatchlistStatus | "all", number> {
  const counts = {
    all: items.length,
    to_watch: 0,
    watching: 0,
    watched: 0,
  } as Record<WatchlistStatus | "all", number>;

  for (const item of items) {
    counts[item.status] += 1;
  }

  return counts;
}

export function countWatchlistByMediaType(
  items: WatchlistItem[]
): Record<WatchlistMediaType | "all", number> {
  const counts = {
    all: items.length,
    movie: 0,
    series: 0,
  } as Record<WatchlistMediaType | "all", number>;

  for (const item of items) {
    counts[item.media_type] += 1;
  }

  return counts;
}

export function countWatchlistByStreamingPlatform(
  items: WatchlistItem[]
): Record<StreamingPlatform | "all", number> {
  const counts = {
    all: items.length,
    ...Object.fromEntries(STREAMING_PLATFORMS.map((platform) => [platform, 0])),
  } as Record<StreamingPlatform | "all", number>;

  for (const item of items) {
    for (const platform of item.streaming_platforms) {
      counts[platform] += 1;
    }
  }

  return counts;
}
