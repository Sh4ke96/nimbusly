import {
  CHORE_NOTES_MAX_LENGTH,
  CHORE_RECURRENCE,
  CHORE_RECURRENCES,
  CHORE_STATUSES,
  CHORE_TITLE_MAX_LENGTH,
  type ChoreRecurrence,
  type ChoreRecurrenceDuration,
  type ChoreStatus,
} from "@/lib/constants/chores";
import { computeNextChoreDueDateWithOptions } from "@/lib/chores/recurrence";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import { getFormString, getFormTrimmedString } from "@/lib/form/values";
import {
  isValidChoreCustomIntervalDays,
  isValidChoreRecurrenceDuration,
  parseChoreCustomIntervalDays,
} from "@/lib/chores/recurrence";
import { normalizeChoreIconEmoji } from "@/lib/chores/emoji";

export { dateToChoreDateString, isValidChoreDateString, parseChoreDateString } from "@/lib/chores/dates";

export interface ChoreTask {
  id: string;
  family_id: string | null;
  title: string;
  notes: string;
  icon_emoji: string | null;
  status: ChoreStatus;
  assigned_to: string | null;
  due_date: string | null;
  recurrence: ChoreRecurrence;
  recurrence_interval_days: number | null;
  recurrence_end_date: string | null;
  recurrence_duration: ChoreRecurrenceDuration | null;
  recurrence_start_date: string | null;
  completed_dates: string[];
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function normalizeChoreTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ");
}

export function isValidChoreTitle(title: string): boolean {
  const normalized = normalizeChoreTitle(title);
  return normalized.length > 0 && normalized.length <= CHORE_TITLE_MAX_LENGTH;
}

export function isValidChoreStatus(value: string): value is ChoreStatus {
  return CHORE_STATUSES.includes(value as ChoreStatus);
}

export function isValidChoreRecurrence(value: string): value is ChoreRecurrence {
  return CHORE_RECURRENCES.includes(value as ChoreRecurrence);
}

export function isValidChoreNotes(notes: string): boolean {
  return notes.length <= CHORE_NOTES_MAX_LENGTH;
}

export function computeNextChoreDueDate(
  from: Date,
  recurrence: ChoreRecurrence,
  intervalDays: number | null = null
): Date | null {
  return computeNextChoreDueDateWithOptions(from, recurrence, intervalDays);
}

export function isValidChoreCustomRecurrence(
  recurrence: ChoreRecurrence | null,
  intervalDays: number | null,
  duration: ChoreRecurrenceDuration | null
): boolean {
  if (!recurrence || recurrence === CHORE_RECURRENCE.NONE) return true;
  if (!duration) return false;
  if (recurrence === CHORE_RECURRENCE.CUSTOM) {
    return intervalDays !== null && isValidChoreCustomIntervalDays(intervalDays);
  }
  return true;
}

export const CHORE_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  TITLE: "title",
  NOTES: "notes",
  STATUS: "status",
  ASSIGNED_TO: "assignedTo",
  DUE_DATE: "dueDate",
  RECURRENCE: "recurrence",
  RECURRENCE_INTERVAL_DAYS: "recurrenceIntervalDays",
  RECURRENCE_DURATION: "recurrenceDuration",
  ICON_EMOJI: "iconEmoji",
  OCCURRENCE_DATE: "occurrenceDate",
} as const;

export function parseChoreIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, CHORE_FORM_FIELD.ID);
}

export function parseChoreStatusFromForm(formData: FormData): {
  id: string;
  status: string;
} {
  return {
    id: getFormTrimmedString(formData, CHORE_FORM_FIELD.ID),
    status: getFormTrimmedString(formData, CHORE_FORM_FIELD.STATUS),
  };
}

export function parseChoreOccurrenceCompleteFromForm(formData: FormData): {
  id: string;
  occurrenceDate: string;
} {
  return {
    id: getFormTrimmedString(formData, CHORE_FORM_FIELD.ID),
    occurrenceDate: getFormTrimmedString(formData, CHORE_FORM_FIELD.OCCURRENCE_DATE),
  };
}

export function parseChoreTaskFromForm(formData: FormData): {
  title: string;
  notes: string;
  iconEmoji: string | null;
  status: ChoreStatus | null;
  assignedTo: string | null;
  dueDate: string | null;
  recurrence: ChoreRecurrence | null;
  recurrenceIntervalDays: number | null;
  recurrenceDuration: ChoreRecurrenceDuration | null;
} {
  const title = normalizeChoreTitle(getFormString(formData, CHORE_FORM_FIELD.TITLE));
  const notes = getFormTrimmedString(formData, CHORE_FORM_FIELD.NOTES);
  const statusRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.STATUS);
  const assignedRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.ASSIGNED_TO);
  const dueDateRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.DUE_DATE);
  const recurrenceRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.RECURRENCE);
  const intervalRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.RECURRENCE_INTERVAL_DAYS);
  const durationRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.RECURRENCE_DURATION);
  const iconEmojiRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.ICON_EMOJI);

  return {
    title,
    notes,
    iconEmoji: iconEmojiRaw ? normalizeChoreIconEmoji(iconEmojiRaw) : null,
    status: isValidChoreStatus(statusRaw) ? statusRaw : null,
    assignedTo: assignedRaw || null,
    dueDate: dueDateRaw || null,
    recurrence: isValidChoreRecurrence(recurrenceRaw) ? recurrenceRaw : null,
    recurrenceIntervalDays: intervalRaw ? parseChoreCustomIntervalDays(intervalRaw) : null,
    recurrenceDuration: isValidChoreRecurrenceDuration(durationRaw) ? durationRaw : null,
  };
}
