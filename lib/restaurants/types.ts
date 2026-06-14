import {
  RESTAURANT_ADDRESS_MAX_LENGTH,
  RESTAURANT_COMMENT_MAX_LENGTH,
  RESTAURANT_NAME_MAX_LENGTH,
  RESTAURANT_NOTES_MAX_LENGTH,
  RESTAURANT_RATING_MAX,
  RESTAURANT_RATING_MIN,
  RESTAURANT_VENUE_TYPES,
  RESTAURANT_VISIT_STATUS,
  RESTAURANT_VISIT_STATUSES,
  type RestaurantVenueType,
  type RestaurantVisitStatus,
} from "@/lib/constants/restaurants";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import { getFormString, getFormTrimmedString } from "@/lib/form/values";

export interface RestaurantPlace {
  id: string;
  family_id: string | null;
  name: string;
  venue_type: RestaurantVenueType;
  visit_status: RestaurantVisitStatus;
  rating: number | null;
  comment: string;
  notes: string;
  address: string;
  visited_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function normalizeRestaurantName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeRestaurantAddress(address: string): string {
  return address.trim().replace(/\s+/g, " ");
}

export function isValidRestaurantName(name: string): boolean {
  const normalized = normalizeRestaurantName(name);
  return normalized.length > 0 && normalized.length <= RESTAURANT_NAME_MAX_LENGTH;
}

export function isValidRestaurantVenueType(value: string): value is RestaurantVenueType {
  return RESTAURANT_VENUE_TYPES.includes(value as RestaurantVenueType);
}

export function isValidRestaurantVisitStatus(value: string): value is RestaurantVisitStatus {
  return RESTAURANT_VISIT_STATUSES.includes(value as RestaurantVisitStatus);
}

export function isValidRestaurantRating(value: number | null): boolean {
  if (value === null) return true;
  return Number.isInteger(value) && value >= RESTAURANT_RATING_MIN && value <= RESTAURANT_RATING_MAX;
}

export function isValidRestaurantAddress(address: string): boolean {
  const normalized = normalizeRestaurantAddress(address);
  return normalized.length > 0 && normalized.length <= RESTAURANT_ADDRESS_MAX_LENGTH;
}

export function isValidRestaurantComment(comment: string): boolean {
  return comment.length <= RESTAURANT_COMMENT_MAX_LENGTH;
}

export function isValidRestaurantNotes(notes: string): boolean {
  return notes.length <= RESTAURANT_NOTES_MAX_LENGTH;
}

export function dateToRestaurantDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseRestaurantDateString(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

export function isValidRestaurantDateString(value: string | null | undefined): boolean {
  if (!value) return true;
  return parseRestaurantDateString(value) !== undefined;
}

export function parseRestaurantRatingFromForm(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

export function validateRestaurantVisitFields(
  visitStatus: RestaurantVisitStatus,
  rating: number | null,
  visitedAt: string | null
): "rating" | "visitedAt" | null {
  if (visitStatus === RESTAURANT_VISIT_STATUS.PLANNED) {
    return null;
  }
  if (rating === null || !isValidRestaurantRating(rating)) {
    return "rating";
  }
  if (!visitedAt || !isValidRestaurantDateString(visitedAt)) {
    return "visitedAt";
  }
  return null;
}

export const RESTAURANT_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  NAME: "name",
  VENUE_TYPE: "venueType",
  VISIT_STATUS: "visitStatus",
  RATING: "rating",
  COMMENT: "comment",
  NOTES: "notes",
  ADDRESS: "address",
  VISITED_AT: "visitedAt",
} as const;

export function parseRestaurantIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, RESTAURANT_FORM_FIELD.ID);
}

export function parseRestaurantPlaceFromForm(formData: FormData): {
  name: string;
  venueType: RestaurantVenueType | null;
  visitStatus: RestaurantVisitStatus | null;
  rating: number | null;
  comment: string;
  notes: string;
  address: string;
  visitedAt: string | null;
} {
  const name = normalizeRestaurantName(getFormString(formData, RESTAURANT_FORM_FIELD.NAME));
  const venueTypeRaw = getFormTrimmedString(formData, RESTAURANT_FORM_FIELD.VENUE_TYPE);
  const visitStatusRaw = getFormTrimmedString(formData, RESTAURANT_FORM_FIELD.VISIT_STATUS);
  const ratingInput = getFormTrimmedString(formData, RESTAURANT_FORM_FIELD.RATING);
  let rating: number | null = null;
  if (ratingInput) {
    const parsed = Number(ratingInput);
    rating = Number.isInteger(parsed) ? parsed : null;
  }
  const comment = getFormTrimmedString(formData, RESTAURANT_FORM_FIELD.COMMENT);
  const notes = getFormTrimmedString(formData, RESTAURANT_FORM_FIELD.NOTES);
  const address = normalizeRestaurantAddress(
    getFormString(formData, RESTAURANT_FORM_FIELD.ADDRESS)
  );
  const visitedAtRaw = getFormTrimmedString(formData, RESTAURANT_FORM_FIELD.VISITED_AT);

  return {
    name,
    venueType: isValidRestaurantVenueType(venueTypeRaw) ? venueTypeRaw : null,
    visitStatus: isValidRestaurantVisitStatus(visitStatusRaw) ? visitStatusRaw : null,
    rating,
    comment,
    notes,
    address,
    visitedAt: visitedAtRaw || null,
  };
}
