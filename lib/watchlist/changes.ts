import type { WatchlistItem } from "@/lib/watchlist/types";
import { normalizeWatchlistTitle } from "@/lib/watchlist/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type WatchlistChangeLabels = Pick<
  Dict["watchlist"],
  | "changeSummaryTitle"
  | "changeSummaryMediaType"
  | "changeSummaryStatus"
  | "changeSummaryNotes"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
  | "mediaTypeLabels"
  | "statusLabels"
>;

export function buildWatchlistChangeSummary(
  before: Pick<WatchlistItem, "title" | "media_type" | "status" | "notes">,
  after: Pick<WatchlistItem, "title" | "media_type" | "status" | "notes">,
  labels: WatchlistChangeLabels
): string {
  const parts: string[] = [];

  if (normalizeWatchlistTitle(before.title) !== normalizeWatchlistTitle(after.title)) {
    parts.push(
      formatMessage(labels.changeSummaryTitle, { from: before.title, to: after.title })
    );
  }

  if (before.media_type !== after.media_type) {
    parts.push(
      formatMessage(labels.changeSummaryMediaType, {
        from: labels.mediaTypeLabels[before.media_type],
        to: labels.mediaTypeLabels[after.media_type],
      })
    );
  }

  if (before.status !== after.status) {
    parts.push(
      formatMessage(labels.changeSummaryStatus, {
        from: labels.statusLabels[before.status],
        to: labels.statusLabels[after.status],
      })
    );
  }

  if (before.notes !== after.notes) {
    parts.push(labels.changeSummaryNotes);
  }

  if (parts.length === 0) {
    return labels.changeSummaryEmpty;
  }

  return parts.join(labels.changeSummarySeparator);
}

export function formatWatchlistNotificationDetail(
  title: string,
  mediaTypeLabel: string,
  statusLabel: string,
  labels: Pick<Dict["watchlist"], "notificationDetailSeparator">
): string {
  return `${normalizeWatchlistTitle(title)}${labels.notificationDetailSeparator}${mediaTypeLabel}${labels.notificationDetailSeparator}${statusLabel}`;
}
