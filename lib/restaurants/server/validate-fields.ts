import {
  isValidRestaurantAddress,
  isValidRestaurantComment,
  isValidRestaurantName,
  isValidRestaurantNotes,
  isValidRestaurantRating,
  isValidRestaurantVenueType,
  isValidRestaurantVisitStatus,
  parseRestaurantPlaceFromForm,
  validateRestaurantVisitFields,
} from "@/lib/restaurants/types";

export function validateRestaurantFields(
  parsed: ReturnType<typeof parseRestaurantPlaceFromForm>
): string | null {
  if (!isValidRestaurantName(parsed.name)) return "name";
  if (!parsed.venueType || !isValidRestaurantVenueType(parsed.venueType)) return "venueType";
  if (!parsed.visitStatus || !isValidRestaurantVisitStatus(parsed.visitStatus)) {
    return "visitStatus";
  }
  if (!isValidRestaurantAddress(parsed.address)) return "address";
  if (!isValidRestaurantComment(parsed.comment)) return "comment";
  if (!isValidRestaurantNotes(parsed.notes)) return "notes";

  const visitError = validateRestaurantVisitFields(
    parsed.visitStatus,
    parsed.rating,
    parsed.visitedAt
  );
  if (visitError) return visitError;

  if (parsed.rating !== null && !isValidRestaurantRating(parsed.rating)) {
    return "rating";
  }

  return null;
}
