import {
  BUDGET_RECURRENCE,
  BUDGET_RECURRENCES,
  type BudgetRecurrence,
} from "@/lib/constants/budget";

function formatBudgetDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseBudgetDateString(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isValidBudgetRecurrence(value: string): value is BudgetRecurrence {
  return BUDGET_RECURRENCES.includes(value as BudgetRecurrence);
}

export function isBudgetEntryRecurring(
  entry: Pick<{ recurrence: BudgetRecurrence }, "recurrence">
): boolean {
  return entry.recurrence !== BUDGET_RECURRENCE.NONE;
}

function getRecurrenceEndDate(
  entry: Pick<{ recurrence_end_date: string | null }, "recurrence_end_date">
): Date | null {
  if (!entry.recurrence_end_date) return null;
  return parseBudgetDateString(entry.recurrence_end_date);
}

export function advanceBudgetRecurrenceDate(
  from: Date,
  recurrence: BudgetRecurrence
): Date | null {
  if (recurrence === BUDGET_RECURRENCE.NONE) return null;

  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  switch (recurrence) {
    case BUDGET_RECURRENCE.WEEKLY:
      next.setDate(next.getDate() + 7);
      break;
    case BUDGET_RECURRENCE.BIWEEKLY:
      next.setDate(next.getDate() + 14);
      break;
    case BUDGET_RECURRENCE.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    case BUDGET_RECURRENCE.YEARLY:
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return next;
}

export function getBudgetOccurrenceDatesInMonth(
  entry: Pick<
    {
      expense_date: string;
      recurrence: BudgetRecurrence;
      recurrence_end_date: string | null;
    },
    "expense_date" | "recurrence" | "recurrence_end_date"
  >,
  monthKey: string
): string[] {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return [];

  const [year, month] = monthKey.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const seriesEnd = getRecurrenceEndDate(entry);

  if (entry.recurrence === BUDGET_RECURRENCE.NONE) {
    const date = parseBudgetDateString(entry.expense_date);
    if (!date || date < monthStart || date > monthEnd) return [];
    return [entry.expense_date];
  }

  let current = parseBudgetDateString(entry.expense_date);
  if (!current) return [];

  const dates: string[] = [];
  const maxIterations = 500;

  for (let i = 0; i < maxIterations && current <= monthEnd; i += 1) {
    if (seriesEnd && current > seriesEnd) break;

    if (current >= monthStart && current <= monthEnd) {
      dates.push(formatBudgetDateString(current));
    }

    if (current > monthEnd) break;

    const next = advanceBudgetRecurrenceDate(current, entry.recurrence);
    if (!next || next.getTime() === current.getTime()) break;
    current = next;
  }

  return dates;
}

export function getNextBudgetDueDate(
  entry: Pick<
    {
      expense_date: string;
      recurrence: BudgetRecurrence;
      recurrence_end_date: string | null;
    },
    "expense_date" | "recurrence" | "recurrence_end_date"
  >,
  today = new Date()
): string | null {
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const seriesEnd = getRecurrenceEndDate(entry);

  if (entry.recurrence === BUDGET_RECURRENCE.NONE) {
    const due = parseBudgetDateString(entry.expense_date);
    if (!due || due < todayDate) return null;
    return entry.expense_date;
  }

  let current = parseBudgetDateString(entry.expense_date);
  if (!current) return null;

  for (let i = 0; i < 500; i += 1) {
    if (seriesEnd && current > seriesEnd) return null;
    if (current >= todayDate) return formatBudgetDateString(current);
    const next = advanceBudgetRecurrenceDate(current, entry.recurrence);
    if (!next) return null;
    current = next;
  }

  return null;
}

export function expandBudgetEntriesForMonth<
  T extends {
    expense_date: string;
    recurrence: BudgetRecurrence;
    recurrence_end_date: string | null;
  },
>(entries: T[], monthKey: string): Array<T & { occurrence_date: string }> {
  const expanded: Array<T & { occurrence_date: string }> = [];

  for (const entry of entries) {
    const dates = getBudgetOccurrenceDatesInMonth(entry, monthKey);
    for (const occurrenceDate of dates) {
      expanded.push({
        ...entry,
        occurrence_date: occurrenceDate,
        expense_date: occurrenceDate,
      });
    }
  }

  return expanded.sort((a, b) => b.occurrence_date.localeCompare(a.occurrence_date));
}
