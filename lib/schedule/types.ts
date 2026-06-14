import {
  SCHEDULE_ENTRY_TYPES,
  SCHEDULE_MAX_ENTRIES_PER_DAY,
  type ScheduleEntryType,
} from "@/lib/constants/schedule";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import { getFormTrimmedString } from "@/lib/form/values";

export { SCHEDULE_MAX_ENTRIES_PER_DAY };
import type { Dict } from "@/lib/i18n/types";

export interface ScheduleEntry {
  id: string;
  family_id: string | null;
  entry_date: string;
  entry_type: ScheduleEntryType;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function isValidScheduleEntryType(value: string): value is ScheduleEntryType {
  return SCHEDULE_ENTRY_TYPES.includes(value as ScheduleEntryType);
}

export function parseEntryDateParts(entryDate: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = entryDate.split("-").map(Number);
  return { year, month, day };
}

export function scheduleDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function scheduleDateKeyFromEntry(entry: Pick<ScheduleEntry, "entry_date">): string {
  return entry.entry_date;
}

export function formatScheduleDateLabel(entryDate: string): string {
  const { day, month, year } = parseEntryDateParts(entryDate);
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

export function getScheduleTypeLabel(
  type: ScheduleEntryType,
  labels: Dict["schedule"]["typeLabels"]
): string {
  return labels[type];
}

export function dateToEntryDateString(date: Date): string {
  return scheduleDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function entryDateToDate(entryDate: string): Date {
  const { year, month, day } = parseEntryDateParts(entryDate);
  return new Date(year, month - 1, day);
}

export function countScheduleEntriesOnDate(
  entries: Pick<ScheduleEntry, "id" | "entry_date">[],
  entryDate: string,
  excludeId?: string
): number {
  return entries.filter(
    (entry) => entry.entry_date === entryDate && entry.id !== excludeId
  ).length;
}

export function isScheduleDayFull(
  entries: Pick<ScheduleEntry, "id" | "entry_date">[],
  entryDate: string,
  excludeId?: string
): boolean {
  return (
    countScheduleEntriesOnDate(entries, entryDate, excludeId) >=
    SCHEDULE_MAX_ENTRIES_PER_DAY
  );
}

export function isValidEntryDateString(entryDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) return false;
  const { year, month, day } = parseEntryDateParts(entryDate);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export const SCHEDULE_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  ENTRY_DATE: "entryDate",
  ENTRY_TYPE: "entryType",
  DESCRIPTION: "description",
} as const;

export function parseScheduleEntryFromForm(formData: FormData): {
  entryDate: string;
  entryType: string;
  description: string;
} {
  return {
    entryDate: getFormTrimmedString(formData, SCHEDULE_FORM_FIELD.ENTRY_DATE),
    entryType: getFormTrimmedString(formData, SCHEDULE_FORM_FIELD.ENTRY_TYPE),
    description: getFormTrimmedString(formData, SCHEDULE_FORM_FIELD.DESCRIPTION),
  };
}

export function parseScheduleIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, SCHEDULE_FORM_FIELD.ID);
}
