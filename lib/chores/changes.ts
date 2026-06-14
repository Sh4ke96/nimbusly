import type { ChoreTask } from "@/lib/chores/types";
import { normalizeChoreTitle } from "@/lib/chores/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type ChoreChangeLabels = Pick<
  Dict["chores"],
  | "changeSummaryTitle"
  | "changeSummaryStatus"
  | "changeSummaryAssignee"
  | "changeSummaryDueDate"
  | "changeSummaryRecurrence"
  | "changeSummaryNotes"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
  | "statusLabels"
  | "recurrenceLabels"
  | "assigneeUnassigned"
>;

export function buildChoreChangeSummary(
  before: Pick<
    ChoreTask,
    "title" | "status" | "assigned_to" | "due_date" | "recurrence" | "notes"
  >,
  after: Pick<
    ChoreTask,
    "title" | "status" | "assigned_to" | "due_date" | "recurrence" | "notes"
  >,
  labels: ChoreChangeLabels,
  resolveAssignee: (id: string | null) => string
): string {
  const parts: string[] = [];

  if (normalizeChoreTitle(before.title) !== normalizeChoreTitle(after.title)) {
    parts.push(formatMessage(labels.changeSummaryTitle, { from: before.title, to: after.title }));
  }
  if (before.status !== after.status) {
    parts.push(
      formatMessage(labels.changeSummaryStatus, {
        from: labels.statusLabels[before.status],
        to: labels.statusLabels[after.status],
      })
    );
  }
  if (before.assigned_to !== after.assigned_to) {
    parts.push(
      formatMessage(labels.changeSummaryAssignee, {
        from: resolveAssignee(before.assigned_to),
        to: resolveAssignee(after.assigned_to),
      })
    );
  }
  if (before.due_date !== after.due_date) {
    parts.push(labels.changeSummaryDueDate);
  }
  if (before.recurrence !== after.recurrence) {
    parts.push(
      formatMessage(labels.changeSummaryRecurrence, {
        from: labels.recurrenceLabels[before.recurrence],
        to: labels.recurrenceLabels[after.recurrence],
      })
    );
  }
  if (before.notes !== after.notes) {
    parts.push(labels.changeSummaryNotes);
  }

  if (parts.length === 0) return labels.changeSummaryEmpty;
  return parts.join(labels.changeSummarySeparator);
}

export function formatChoreNotificationDetail(
  title: string,
  statusLabel: string,
  labels: Pick<Dict["chores"], "notificationDetailSeparator">
): string {
  return `${normalizeChoreTitle(title)}${labels.notificationDetailSeparator}${statusLabel}`;
}
