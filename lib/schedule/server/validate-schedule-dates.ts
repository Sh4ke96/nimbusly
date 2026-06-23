import {
  isValidEntryDateRange,
  isValidEntryDateString,
  normalizeScheduleEntryEndDate,
} from "@/lib/schedule/types";

export function parseAndValidateScheduleDates(
  entryDate: string,
  entryEndDate: string,
  errors: { invalidDate: string; endBeforeStart: string }
): { entryDate: string; entryEndDate: string | null } | { error: string } {
  if (!entryDate || !isValidEntryDateString(entryDate)) {
    return { error: errors.invalidDate };
  }

  const resolvedEnd = entryEndDate || entryDate;
  if (!isValidEntryDateRange(entryDate, resolvedEnd)) {
    return { error: errors.endBeforeStart };
  }

  return {
    entryDate,
    entryEndDate: normalizeScheduleEntryEndDate(entryDate, resolvedEnd),
  };
}
