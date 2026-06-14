import type { GiftIdea } from "@/lib/gifts/types";
import { normalizeRecipientName } from "@/lib/gifts/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type GiftChangeLabels = Pick<
  Dict["gifts"],
  | "changeSummaryRecipient"
  | "changeSummaryContent"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
>;

export function buildGiftChangeSummary(
  before: Pick<GiftIdea, "recipient_name" | "content">,
  after: Pick<GiftIdea, "recipient_name" | "content">,
  labels: GiftChangeLabels
): string {
  const parts: string[] = [];

  if (normalizeRecipientName(before.recipient_name) !== normalizeRecipientName(after.recipient_name)) {
    parts.push(
      formatMessage(labels.changeSummaryRecipient, {
        from: before.recipient_name,
        to: after.recipient_name,
      })
    );
  }

  if (before.content !== after.content) {
    parts.push(labels.changeSummaryContent);
  }

  if (parts.length === 0) {
    return labels.changeSummaryEmpty;
  }

  return parts.join(labels.changeSummarySeparator);
}

export function formatGiftNotificationDetail(
  recipientName: string,
  content: string,
  labels: Pick<Dict["gifts"], "notificationDetailSeparator">
): string {
  const preview = content.trim();
  const base = normalizeRecipientName(recipientName);
  if (!preview) return base;
  return `${base}${labels.notificationDetailSeparator}${preview}`;
}
