import type { BirthdayEntry } from "@/lib/birthdays/types";
import { formatBirthdayLabel } from "@/lib/birthdays/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type BirthdayChangeLabels = Pick<
  Dict["birthdays"],
  | "changeSummaryName"
  | "changeSummaryDate"
  | "changeSummaryDescription"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
>;

export function buildBirthdayChangeSummary(
  before: Pick<BirthdayEntry, "person_name" | "birth_month" | "birth_day" | "description">,
  after: Pick<BirthdayEntry, "person_name" | "birth_month" | "birth_day" | "description">,
  labels: BirthdayChangeLabels
): string {
  const parts: string[] = [];

  if (before.person_name !== after.person_name) {
    parts.push(
      formatMessage(labels.changeSummaryName, {
        from: before.person_name,
        to: after.person_name,
      })
    );
  }

  if (before.birth_month !== after.birth_month || before.birth_day !== after.birth_day) {
    parts.push(
      formatMessage(labels.changeSummaryDate, {
        from: formatBirthdayLabel(before),
        to: formatBirthdayLabel(after),
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
