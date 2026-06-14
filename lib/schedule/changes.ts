import type { ScheduleEntry } from "@/lib/schedule/types";
import {
  formatScheduleDateLabel,
  getScheduleTypeLabel,
} from "@/lib/schedule/types";
import type { ScheduleEntryType } from "@/lib/constants/schedule";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type ScheduleChangeLabels = Pick<
  Dict["schedule"],
  | "changeSummaryType"
  | "changeSummaryDate"
  | "changeSummaryDescription"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
  | "typeLabels"
>;

export function buildScheduleChangeSummary(
  before: Pick<ScheduleEntry, "entry_date" | "entry_type" | "description">,
  after: Pick<ScheduleEntry, "entry_date" | "entry_type" | "description">,
  labels: ScheduleChangeLabels
): string {
  const parts: string[] = [];

  if (before.entry_type !== after.entry_type) {
    parts.push(
      formatMessage(labels.changeSummaryType, {
        from: getScheduleTypeLabel(before.entry_type, labels.typeLabels),
        to: getScheduleTypeLabel(after.entry_type, labels.typeLabels),
      })
    );
  }

  if (before.entry_date !== after.entry_date) {
    parts.push(
      formatMessage(labels.changeSummaryDate, {
        from: formatScheduleDateLabel(before.entry_date),
        to: formatScheduleDateLabel(after.entry_date),
      })
    );
  }

  if (before.description !== after.description) {
    parts.push(labels.changeSummaryDescription);
  }

  if (parts.length === 0) {
    return labels.changeSummaryEmpty;
  }

  return parts.join(labels.changeSummarySeparator);
}

export function formatScheduleNotificationDetail(
  entryType: ScheduleEntryType,
  entryDate: string,
  description: string,
  labels: Pick<Dict["schedule"], "typeLabels" | "notificationDetailSeparator">
): string {
  const typeLabel = getScheduleTypeLabel(entryType, labels.typeLabels);
  const dateLabel = formatScheduleDateLabel(entryDate);
  const base = `${typeLabel}${labels.notificationDetailSeparator}${dateLabel}`;
  if (!description.trim()) return base;
  return `${base}${labels.notificationDetailSeparator}${description.trim()}`;
}
