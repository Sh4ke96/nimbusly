import { RESTAURANT_FILTER_ALL, RESTAURANT_VISIT_STATUS } from "@/lib/constants/restaurants";
import type { RestaurantVenueType, RestaurantVisitStatus } from "@/lib/constants/restaurants";
import type { RestaurantPlace } from "@/lib/restaurants/types";

export function filterRestaurantsByVisitStatus(
  items: RestaurantPlace[],
  filterKey: string
): RestaurantPlace[] {
  if (filterKey === RESTAURANT_FILTER_ALL) return items;
  return items.filter((item) => item.visit_status === filterKey);
}

export function filterRestaurantsByVenueType(
  items: RestaurantPlace[],
  filterKey: string
): RestaurantPlace[] {
  if (filterKey === RESTAURANT_FILTER_ALL) return items;
  return items.filter((item) => item.venue_type === filterKey);
}

export function countRestaurantsByVisitStatus(
  items: RestaurantPlace[]
): Record<RestaurantVisitStatus | "all", number> {
  const counts = {
    all: items.length,
    planned: 0,
    visited: 0,
  } as Record<RestaurantVisitStatus | "all", number>;

  for (const item of items) {
    counts[item.visit_status] += 1;
  }

  return counts;
}

export function countRestaurantsByVenueType(
  items: RestaurantPlace[]
): Record<RestaurantVenueType | "all", number> {
  const counts = {
    all: items.length,
    restaurant: 0,
    pub: 0,
  } as Record<RestaurantVenueType | "all", number>;

  for (const item of items) {
    counts[item.venue_type] += 1;
  }

  return counts;
}

export function sortRestaurantsByVisitedAt(items: RestaurantPlace[]): RestaurantPlace[] {
  return [...items].sort((a, b) => {
    if (a.visit_status !== b.visit_status) {
      if (a.visit_status === RESTAURANT_VISIT_STATUS.PLANNED) return -1;
      if (b.visit_status === RESTAURANT_VISIT_STATUS.PLANNED) return 1;
    }
    if (a.visited_at && b.visited_at) {
      return b.visited_at.localeCompare(a.visited_at);
    }
    if (a.visited_at) return -1;
    if (b.visited_at) return 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}
