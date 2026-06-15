import type { ScheduleEntry } from "@/lib/schedule/types";
import {
  formatScheduleDateRangeLabel,
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
  | "dateRangeSeparator"
  | "typeLabels"
>;

type ScheduleDateFields = Pick<ScheduleEntry, "entry_date" | "entry_end_date">;

function formatScheduleEntryDateLabel(
  entry: ScheduleDateFields,
  rangeSeparator: string
): string {
  return formatScheduleDateRangeLabel(
    entry.entry_date,
    entry.entry_end_date,
    rangeSeparator
  );
}

export function buildScheduleChangeSummary(
  before: Pick<ScheduleEntry, "entry_date" | "entry_end_date" | "entry_type" | "description">,
  after: Pick<ScheduleEntry, "entry_date" | "entry_end_date" | "entry_type" | "description">,
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

  const beforeDateLabel = formatScheduleEntryDateLabel(before, labels.dateRangeSeparator);
  const afterDateLabel = formatScheduleEntryDateLabel(after, labels.dateRangeSeparator);

  if (beforeDateLabel !== afterDateLabel) {
    parts.push(
      formatMessage(labels.changeSummaryDate, {
        from: beforeDateLabel,
        to: afterDateLabel,
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
  entryEndDate: string | null,
  description: string,
  labels: Pick<Dict["schedule"], "typeLabels" | "notificationDetailSeparator" | "dateRangeSeparator">
): string {
  const typeLabel = getScheduleTypeLabel(entryType, labels.typeLabels);
  const dateLabel = formatScheduleDateRangeLabel(
    entryDate,
    entryEndDate,
    labels.dateRangeSeparator
  );
  const base = `${typeLabel}${labels.notificationDetailSeparator}${dateLabel}`;
  if (!description.trim()) return base;
  return `${base}${labels.notificationDetailSeparator}${description.trim()}`;
}
