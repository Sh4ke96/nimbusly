import type { RestaurantPlace } from "@/lib/restaurants/types";
import {
  normalizeRestaurantAddress,
  normalizeRestaurantName,
} from "@/lib/restaurants/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type RestaurantChangeLabels = Pick<
  Dict["restaurants"],
  | "changeSummaryName"
  | "changeSummaryVenueType"
  | "changeSummaryVisitStatus"
  | "changeSummaryRating"
  | "changeSummaryComment"
  | "changeSummaryNotes"
  | "changeSummaryAddress"
  | "changeSummaryVisitedAt"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
  | "venueTypeLabels"
  | "visitStatusLabels"
>;

export function formatRestaurantRatingLabel(
  rating: number | null,
  labels: Pick<Dict["restaurants"], "ratingNone">
): string {
  if (rating === null) return labels.ratingNone;
  return String(rating);
}

export function buildRestaurantChangeSummary(
  before: Pick<
    RestaurantPlace,
    | "name"
    | "venue_type"
    | "visit_status"
    | "rating"
    | "comment"
    | "notes"
    | "address"
    | "visited_at"
  >,
  after: Pick<
    RestaurantPlace,
    | "name"
    | "venue_type"
    | "visit_status"
    | "rating"
    | "comment"
    | "notes"
    | "address"
    | "visited_at"
  >,
  labels: RestaurantChangeLabels
): string {
  const parts: string[] = [];

  if (normalizeRestaurantName(before.name) !== normalizeRestaurantName(after.name)) {
    parts.push(formatMessage(labels.changeSummaryName, { from: before.name, to: after.name }));
  }

  if (before.venue_type !== after.venue_type) {
    parts.push(
      formatMessage(labels.changeSummaryVenueType, {
        from: labels.venueTypeLabels[before.venue_type],
        to: labels.venueTypeLabels[after.venue_type],
      })
    );
  }

  if (before.visit_status !== after.visit_status) {
    parts.push(
      formatMessage(labels.changeSummaryVisitStatus, {
        from: labels.visitStatusLabels[before.visit_status],
        to: labels.visitStatusLabels[after.visit_status],
      })
    );
  }

  if (before.rating !== after.rating) {
    parts.push(labels.changeSummaryRating);
  }

  if (before.comment !== after.comment) {
    parts.push(labels.changeSummaryComment);
  }

  if (before.notes !== after.notes) {
    parts.push(labels.changeSummaryNotes);
  }

  if (normalizeRestaurantAddress(before.address) !== normalizeRestaurantAddress(after.address)) {
    parts.push(labels.changeSummaryAddress);
  }

  if (before.visited_at !== after.visited_at) {
    parts.push(labels.changeSummaryVisitedAt);
  }

  if (parts.length === 0) {
    return labels.changeSummaryEmpty;
  }

  return parts.join(labels.changeSummarySeparator);
}

export function formatRestaurantNotificationDetail(
  name: string,
  venueTypeLabel: string,
  visitStatusLabel: string,
  labels: Pick<Dict["restaurants"], "notificationDetailSeparator">
): string {
  return `${normalizeRestaurantName(name)}${labels.notificationDetailSeparator}${venueTypeLabel}${labels.notificationDetailSeparator}${visitStatusLabel}`;
}
