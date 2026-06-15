import { CHORE_RECURRENCE, CHORE_STATUS, type ChoreStatus } from "@/lib/constants/chores";
import { getChoreRecurrenceEnd, getChoreRecurrenceStart, iterChoreOccurrences } from "@/lib/chores/calendar";
import { dateToChoreDateString, parseChoreDateString } from "@/lib/chores/dates";
import { computeNextChoreDueDateWithOptions } from "@/lib/chores/recurrence";
import type { ChoreTask } from "@/lib/chores/types";

export type ChoreCompletionFields = Pick<
  ChoreTask,
  | "recurrence"
  | "due_date"
  | "recurrence_start_date"
  | "recurrence_end_date"
  | "recurrence_interval_days"
  | "completed_dates"
>;

export function normalizeCompletedDates(dates: string[] | null | undefined): string[] {
  if (!dates?.length) return [];
  const unique = [...new Set(dates.filter((d) => parseChoreDateString(d)))];
  return unique.sort((a, b) => a.localeCompare(b));
}

export function isChoreOccurrenceCompleted(
  task: Pick<ChoreTask, "completed_dates">,
  occurrenceDate: string
): boolean {
  return normalizeCompletedDates(task.completed_dates).includes(occurrenceDate);
}

export function isOccurrenceInChoreSeries(
  task: ChoreCompletionFields,
  occurrenceDate: string
): boolean {
  const parsed = parseChoreDateString(occurrenceDate);
  if (!parsed) return false;

  if (task.recurrence === CHORE_RECURRENCE.NONE) {
    return task.due_date === occurrenceDate;
  }

  const start = getChoreRecurrenceStart(task);
  const end = getChoreRecurrenceEnd(task);
  if (!start || !end) return false;

  const occurrences = iterChoreOccurrences(
    {
      ...task,
      id: "",
      title: "",
      icon_emoji: null,
      status: CHORE_STATUS.PENDING,
      completed_dates: task.completed_dates ?? [],
    },
    parsed,
    parsed
  );
  return occurrences.some((item) => item.date === occurrenceDate);
}

export function findNextIncompleteOccurrenceDate(
  task: ChoreCompletionFields
): string | null {
  if (task.recurrence === CHORE_RECURRENCE.NONE) {
    if (!task.due_date || isChoreOccurrenceCompleted(task, task.due_date)) return null;
    return task.due_date;
  }

  const start = getChoreRecurrenceStart(task);
  if (!start) return null;

  const seriesEnd = getChoreRecurrenceEnd(task);
  const completedSet = new Set(normalizeCompletedDates(task.completed_dates));
  let current = start;
  let guard = 0;

  while (guard < 400) {
    guard += 1;
    const dateStr = dateToChoreDateString(current);
    if (seriesEnd && current.getTime() > seriesEnd.getTime()) break;
    if (!completedSet.has(dateStr)) return dateStr;

    const next = computeNextChoreDueDateWithOptions(
      current,
      task.recurrence,
      task.recurrence_interval_days
    );
    if (!next || next.getTime() <= current.getTime()) break;
    current = next;
  }

  return null;
}

export function countChoreSeriesOccurrences(task: ChoreCompletionFields): number {
  if (task.recurrence === CHORE_RECURRENCE.NONE) {
    return task.due_date ? 1 : 0;
  }

  const start = getChoreRecurrenceStart(task);
  const end = getChoreRecurrenceEnd(task);
  if (!start || !end) return 0;

  return iterChoreOccurrences(
    {
      ...task,
      id: "",
      title: "",
      icon_emoji: null,
      status: CHORE_STATUS.PENDING,
      completed_dates: task.completed_dates ?? [],
    },
    start,
    end
  ).length;
}

export function resolveOccurrenceDateToComplete(task: ChoreCompletionFields): string | null {
  if (task.due_date && isOccurrenceInChoreSeries(task, task.due_date)) {
    return task.due_date;
  }
  return findNextIncompleteOccurrenceDate(task);
}

export function computeChoreStateAfterOccurrenceComplete(
  task: ChoreCompletionFields,
  occurrenceDate: string
): {
  completed_dates: string[];
  due_date: string | null;
  status: ChoreStatus;
  completed_at: string | null;
} {
  const completed_dates = normalizeCompletedDates([
    ...task.completed_dates,
    occurrenceDate,
  ]);

  const nextDue = findNextIncompleteOccurrenceDate({ ...task, completed_dates });

  if (!nextDue) {
    return {
      completed_dates,
      due_date: null,
      status: CHORE_STATUS.COMPLETED,
      completed_at: new Date().toISOString(),
    };
  }

  return {
    completed_dates,
    due_date: nextDue,
    status: CHORE_STATUS.PENDING,
    completed_at: null,
  };
}
