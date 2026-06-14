export const RESTAURANT_VENUE_TYPE = {
  RESTAURANT: "restaurant",
  PUB: "pub",
} as const;

export const RESTAURANT_VENUE_TYPES = [
  RESTAURANT_VENUE_TYPE.RESTAURANT,
  RESTAURANT_VENUE_TYPE.PUB,
] as const;

export type RestaurantVenueType = (typeof RESTAURANT_VENUE_TYPES)[number];

export const RESTAURANT_VISIT_STATUS = {
  PLANNED: "planned",
  VISITED: "visited",
} as const;

export const RESTAURANT_VISIT_STATUSES = [
  RESTAURANT_VISIT_STATUS.PLANNED,
  RESTAURANT_VISIT_STATUS.VISITED,
] as const;

export type RestaurantVisitStatus = (typeof RESTAURANT_VISIT_STATUSES)[number];

export const RESTAURANT_FILTER_ALL = "all";

export const RESTAURANT_NAME_MAX_LENGTH = 120;
export const RESTAURANT_ADDRESS_MAX_LENGTH = 300;
export const RESTAURANT_COMMENT_MAX_LENGTH = 500;
export const RESTAURANT_NOTES_MAX_LENGTH = 500;

export const RESTAURANT_RATING_MIN = 1;
export const RESTAURANT_RATING_MAX = 5;
