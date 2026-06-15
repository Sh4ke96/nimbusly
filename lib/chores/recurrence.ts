import {
  CHORE_CUSTOM_INTERVAL_MAX,
  CHORE_CUSTOM_INTERVAL_MIN,
  CHORE_RECURRENCE,
  CHORE_RECURRENCE_DURATION,
  CHORE_RECURRENCE_DURATIONS,
  type ChoreRecurrence,
  type ChoreRecurrenceDuration,
} from "@/lib/constants/chores";
import {
  dateToChoreDateString,
  parseChoreDateString,
} from "@/lib/chores/dates";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

export function isValidChoreRecurrenceDuration(
  value: string
): value is ChoreRecurrenceDuration {
  return CHORE_RECURRENCE_DURATIONS.includes(value as ChoreRecurrenceDuration);
}

export function isValidChoreCustomIntervalDays(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= CHORE_CUSTOM_INTERVAL_MIN &&
    value <= CHORE_CUSTOM_INTERVAL_MAX
  );
}

export function parseChoreCustomIntervalDays(raw: string): number | null {
  const value = Number(raw.trim());
  if (!Number.isFinite(value)) return null;
  return isValidChoreCustomIntervalDays(value) ? value : null;
}

export function computeRecurrenceEndDate(
  start: Date,
  duration: ChoreRecurrenceDuration
): Date {
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  switch (duration) {
    case CHORE_RECURRENCE_DURATION.MONTH:
      end.setMonth(end.getMonth() + 1);
      break;
    case CHORE_RECURRENCE_DURATION.QUARTER:
      end.setMonth(end.getMonth() + 3);
      break;
    case CHORE_RECURRENCE_DURATION.HALF_YEAR:
      end.setMonth(end.getMonth() + 6);
      break;
    case CHORE_RECURRENCE_DURATION.YEAR:
      end.setFullYear(end.getFullYear() + 1);
      break;
  }
  return end;
}

export function computeNextChoreDueDateWithOptions(
  from: Date,
  recurrence: ChoreRecurrence,
  intervalDays: number | null
): Date | null {
  if (recurrence === CHORE_RECURRENCE.NONE) return null;

  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  if (recurrence === CHORE_RECURRENCE.CUSTOM) {
    if (!intervalDays || !isValidChoreCustomIntervalDays(intervalDays)) return null;
    next.setDate(next.getDate() + intervalDays);
    return next;
  }

  switch (recurrence) {
    case CHORE_RECURRENCE.DAILY:
      next.setDate(next.getDate() + 1);
      break;
    case CHORE_RECURRENCE.WEEKLY:
      next.setDate(next.getDate() + 7);
      break;
    case CHORE_RECURRENCE.BIWEEKLY:
      next.setDate(next.getDate() + 14);
      break;
    case CHORE_RECURRENCE.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null;
  }

  return next;
}

export function shouldRescheduleChoreAfterComplete(
  task: { recurrence_end_date: string | null },
  nextDue: Date
): boolean {
  if (!task.recurrence_end_date) return true;
  const end = parseChoreDateString(task.recurrence_end_date);
  if (!end) return true;
  return nextDue.getTime() <= end.getTime();
}

export function formatChoreRecurrenceShortLabel(
  task: {
    recurrence: ChoreRecurrence;
    recurrence_interval_days: number | null;
  },
  labels: Pick<Dict["chores"], "recurrenceLabels" | "recurrenceCustomEvery">
): string | null {
  if (task.recurrence === CHORE_RECURRENCE.NONE) return null;

  if (task.recurrence === CHORE_RECURRENCE.CUSTOM && task.recurrence_interval_days) {
    return formatMessage(labels.recurrenceCustomEvery, {
      count: String(task.recurrence_interval_days),
    });
  }

  return labels.recurrenceLabels[task.recurrence];
}

export function formatChoreScheduleLabel(
  task: {
    recurrence: ChoreRecurrence;
    due_date: string | null;
    recurrence_start_date: string | null;
    recurrence_end_date: string | null;
    recurrence_interval_days: number | null;
  },
  labels: Pick<
    Dict["chores"],
    | "recurrenceLabels"
    | "recurrenceCustomEvery"
    | "scheduleDue"
    | "scheduleRecurringFromUntil"
    | "scheduleRecurringFrom"
  >,
  formatDate: (iso: string) => string
): string | null {
  if (task.recurrence === CHORE_RECURRENCE.NONE) {
    return task.due_date
      ? formatMessage(labels.scheduleDue, { date: formatDate(task.due_date) })
      : null;
  }

  const recurrence = formatChoreRecurrenceShortLabel(task, labels);
  const start = task.recurrence_start_date ?? task.due_date;
  if (!recurrence || !start) return recurrence;

  if (task.recurrence_end_date) {
    return formatMessage(labels.scheduleRecurringFromUntil, {
      recurrence,
      start: formatDate(start),
      end: formatDate(task.recurrence_end_date),
    });
  }

  return formatMessage(labels.scheduleRecurringFrom, {
    recurrence,
    start: formatDate(start),
  });
}

/** @deprecated Use formatChoreScheduleLabel or formatChoreRecurrenceShortLabel */
export function formatChoreRecurrenceLabel(
  task: {
    recurrence: ChoreRecurrence;
    recurrence_interval_days: number | null;
    recurrence_end_date: string | null;
    recurrence_duration: ChoreRecurrenceDuration | null;
  },
  labels: Pick<
    Dict["chores"],
    "recurrenceLabels" | "recurrenceCustomEvery" | "recurrenceDurationLabels"
  >
): string | null {
  return formatChoreRecurrenceShortLabel(task, labels);
}

export function resolveChoreRecurrenceFields(
  recurrence: ChoreRecurrence,
  intervalDays: number | null,
  duration: ChoreRecurrenceDuration | null,
  dueDate: string | null
): {
  recurrence_interval_days: number | null;
  recurrence_end_date: string | null;
  recurrence_duration: ChoreRecurrenceDuration | null;
  recurrence_start_date: string | null;
} {
  if (recurrence === CHORE_RECURRENCE.NONE) {
    return {
      recurrence_interval_days: null,
      recurrence_end_date: null,
      recurrence_duration: null,
      recurrence_start_date: null,
    };
  }

  const start = dueDate ? parseChoreDateString(dueDate) : new Date();
  const base = start ?? new Date();
  const startDate = dateToChoreDateString(base);

  if (recurrence === CHORE_RECURRENCE.CUSTOM) {
    if (!intervalDays || !duration) {
      return {
        recurrence_interval_days: null,
        recurrence_end_date: null,
        recurrence_duration: null,
        recurrence_start_date: startDate,
      };
    }
    return {
      recurrence_interval_days: intervalDays,
      recurrence_end_date: dateToChoreDateString(computeRecurrenceEndDate(base, duration)),
      recurrence_duration: duration,
      recurrence_start_date: startDate,
    };
  }

  if (!duration) {
    return {
      recurrence_interval_days: null,
      recurrence_end_date: null,
      recurrence_duration: null,
      recurrence_start_date: startDate,
    };
  }

  return {
    recurrence_interval_days: null,
    recurrence_end_date: dateToChoreDateString(computeRecurrenceEndDate(base, duration)),
    recurrence_duration: duration,
    recurrence_start_date: startDate,
  };
}
