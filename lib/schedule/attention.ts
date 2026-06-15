import {
  getScheduleEntryEndDate,
  isScheduleEntryRange,
  type ScheduleEntry,
} from "@/lib/schedule/types";
import { daysUntilBudgetDueDate } from "@/lib/budget/reminders";

export const SCHEDULE_ENDING_ATTENTION_DAYS = 3;

export function isScheduleEntryEndingSoon(
  entry: Pick<ScheduleEntry, "entry_date" | "entry_end_date">,
  today = new Date(),
  withinDays = SCHEDULE_ENDING_ATTENTION_DAYS
): boolean {
  if (!isScheduleEntryRange(entry)) return false;
  const endDate = getScheduleEntryEndDate(entry);
  const daysUntil = daysUntilBudgetDueDate(endDate, today);
  if (daysUntil === null || daysUntil < 0) return false;
  return daysUntil <= withinDays;
}
