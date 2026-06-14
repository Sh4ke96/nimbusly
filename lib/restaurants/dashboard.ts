import { RESTAURANT_VISIT_STATUS } from "@/lib/constants/restaurants";
import type { RestaurantPlace } from "@/lib/restaurants/types";

/** Visited places with a rating, best first, then most recently added. */
export function pickBestRecentRestaurants(
  places: RestaurantPlace[],
  limit = 3
): RestaurantPlace[] {
  return [...places]
    .filter(
      (place) =>
        place.visit_status === RESTAURANT_VISIT_STATUS.VISITED && place.rating !== null
    )
    .sort((a, b) => {
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, limit);
}

export function countPlannedRestaurants(places: RestaurantPlace[]): number {
  return places.filter((place) => place.visit_status === RESTAURANT_VISIT_STATUS.PLANNED)
    .length;
}
