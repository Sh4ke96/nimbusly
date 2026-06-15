import { CHORE_RECURRENCE, type ChoreRecurrence } from "@/lib/constants/chores";
import { isChoreOccurrenceCompleted } from "@/lib/chores/completion";
import { dateToChoreDateString, parseChoreDateString } from "@/lib/chores/dates";
import { computeNextChoreDueDateWithOptions } from "@/lib/chores/recurrence";
import type { ChoreTask } from "@/lib/chores/types";

export interface ChoreCalendarOccurrence {
  taskId: string;
  title: string;
  iconEmoji: string | null;
  date: string;
  isNextDue: boolean;
  isCompleted: boolean;
}

function monthRange(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0),
  };
}

function compareDates(a: Date, b: Date): number {
  return a.getTime() - b.getTime();
}

export function getChoreRecurrenceStart(task: Pick<
  ChoreTask,
  "recurrence_start_date" | "due_date" | "recurrence"
>): Date | null {
  if (task.recurrence === CHORE_RECURRENCE.NONE) {
    return task.due_date ? parseChoreDateString(task.due_date) ?? null : null;
  }
  const start = task.recurrence_start_date ?? task.due_date;
  return start ? parseChoreDateString(start) ?? null : null;
}

export function getChoreRecurrenceEnd(task: Pick<
  ChoreTask,
  "recurrence_end_date" | "recurrence"
>): Date | null {
  if (task.recurrence === CHORE_RECURRENCE.NONE) return null;
  return task.recurrence_end_date
    ? parseChoreDateString(task.recurrence_end_date) ?? null
    : null;
}

export function iterChoreOccurrences(
  task: Pick<
    ChoreTask,
    | "id"
    | "title"
    | "status"
    | "recurrence"
    | "due_date"
    | "recurrence_start_date"
    | "recurrence_end_date"
    | "recurrence_interval_days"
    | "icon_emoji"
    | "completed_dates"
  >,
  rangeStart: Date,
  rangeEnd: Date
): ChoreCalendarOccurrence[] {
  if (task.recurrence === CHORE_RECURRENCE.NONE) {
    const due = task.due_date ? parseChoreDateString(task.due_date) : null;
    if (!due || compareDates(due, rangeStart) < 0 || compareDates(due, rangeEnd) > 0) {
      return [];
    }
    return [
      {
        taskId: task.id,
        title: task.title,
        iconEmoji: task.icon_emoji,
        date: dateToChoreDateString(due),
        isNextDue: task.due_date === dateToChoreDateString(due),
        isCompleted: isChoreOccurrenceCompleted(task, dateToChoreDateString(due)),
      },
    ];
  }

  const start = getChoreRecurrenceStart(task);
  if (!start) return [];

  const seriesEnd = getChoreRecurrenceEnd(task) ?? rangeEnd;
  const effectiveEnd = compareDates(seriesEnd, rangeEnd) <= 0 ? seriesEnd : rangeEnd;
  const nextDue = task.due_date;
  const completedSet = new Set(
    (task.completed_dates ?? []).map((d) => d)
  );

  const occurrences: ChoreCalendarOccurrence[] = [];
  let current = start;
  let guard = 0;

  while (compareDates(current, effectiveEnd) <= 0 && guard < 400) {
    guard += 1;
    const dateStr = dateToChoreDateString(current);
    const isCompleted = completedSet.has(dateStr) || isChoreOccurrenceCompleted(task, dateStr);
    if (compareDates(current, rangeStart) >= 0) {
      occurrences.push({
        taskId: task.id,
        title: task.title,
        iconEmoji: task.icon_emoji,
        date: dateStr,
        isNextDue: nextDue === dateStr && !isCompleted,
        isCompleted,
      });
    }
    const next = computeNextChoreDueDateWithOptions(
      current,
      task.recurrence as ChoreRecurrence,
      task.recurrence_interval_days
    );
    if (!next || compareDates(next, current) <= 0) break;
    current = next;
  }

  return occurrences;
}

export function getChoreOccurrencesInMonth(
  tasks: ChoreTask[],
  year: number,
  month: number
): ChoreCalendarOccurrence[] {
  const { start, end } = monthRange(year, month);
  const all: ChoreCalendarOccurrence[] = [];

  for (const task of tasks) {
    all.push(...iterChoreOccurrences(task, start, end));
  }

  return all.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function groupChoreOccurrencesByDay(
  occurrences: ChoreCalendarOccurrence[]
): Map<number, ChoreCalendarOccurrence[]> {
  const map = new Map<number, ChoreCalendarOccurrence[]>();
  for (const item of occurrences) {
    const parsed = parseChoreDateString(item.date);
    if (!parsed) continue;
    const day = parsed.getDate();
    const list = map.get(day) ?? [];
    list.push(item);
    map.set(day, list);
  }
  return map;
}

export function choreDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
