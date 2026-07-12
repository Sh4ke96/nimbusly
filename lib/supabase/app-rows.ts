import type { ChoreTask } from "@/lib/chores/types";
import type { MedicineItem } from "@/lib/medicine/types";
import type { PetCareItem } from "@/lib/pets/types";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import type { ScheduleEntry } from "@/lib/schedule/types";
import type { WatchlistItem } from "@/lib/watchlist/types";
import { normalizeStreamingPlatforms } from "@/lib/watchlist/streaming-platforms";
import type { Database } from "@/lib/supabase/database.types";

type Tables = Database["public"]["Tables"];

/** Maps a Supabase row (full or partial select) to app enums - DB columns are plain text. */
export function choreTaskFromRow(row: unknown): ChoreTask {
  return row as ChoreTask;
}

export function medicineItemFromRow(row: unknown): MedicineItem {
  return row as MedicineItem;
}

export function watchlistItemFromRow(row: unknown): WatchlistItem {
  const item = row as WatchlistItem;
  return {
    ...item,
    streaming_platforms: normalizeStreamingPlatforms(item.streaming_platforms ?? []),
  };
}

export function restaurantPlaceFromRow(row: unknown): RestaurantPlace {
  return row as RestaurantPlace;
}

export function scheduleEntryFromRow(row: unknown): ScheduleEntry {
  return row as ScheduleEntry;
}

export function petCareItemFromRow(row: unknown): PetCareItem {
  return row as PetCareItem;
}

export type ShoppingListItemUpdate = Tables["shopping_list_items"]["Update"];
