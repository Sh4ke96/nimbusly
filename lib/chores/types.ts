import {
  CHORE_NOTES_MAX_LENGTH,
  CHORE_RECURRENCE,
  CHORE_RECURRENCES,
  CHORE_STATUSES,
  CHORE_TITLE_MAX_LENGTH,
  type ChoreRecurrence,
  type ChoreStatus,
} from "@/lib/constants/chores";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import { getFormString, getFormTrimmedString } from "@/lib/form/values";

export interface ChoreTask {
  id: string;
  family_id: string | null;
  title: string;
  notes: string;
  status: ChoreStatus;
  assigned_to: string | null;
  due_date: string | null;
  recurrence: ChoreRecurrence;
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

export function dateToChoreDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseChoreDateString(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

export function isValidChoreDateString(value: string | null | undefined): boolean {
  if (!value) return true;
  return parseChoreDateString(value) !== undefined;
}

export function computeNextChoreDueDate(
  from: Date,
  recurrence: ChoreRecurrence
): Date | null {
  if (recurrence === CHORE_RECURRENCE.NONE) return null;
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate());
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

export const CHORE_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  TITLE: "title",
  NOTES: "notes",
  STATUS: "status",
  ASSIGNED_TO: "assignedTo",
  DUE_DATE: "dueDate",
  RECURRENCE: "recurrence",
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

export function parseChoreTaskFromForm(formData: FormData): {
  title: string;
  notes: string;
  status: ChoreStatus | null;
  assignedTo: string | null;
  dueDate: string | null;
  recurrence: ChoreRecurrence | null;
} {
  const title = normalizeChoreTitle(getFormString(formData, CHORE_FORM_FIELD.TITLE));
  const notes = getFormTrimmedString(formData, CHORE_FORM_FIELD.NOTES);
  const statusRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.STATUS);
  const assignedRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.ASSIGNED_TO);
  const dueDateRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.DUE_DATE);
  const recurrenceRaw = getFormTrimmedString(formData, CHORE_FORM_FIELD.RECURRENCE);

  return {
    title,
    notes,
    status: isValidChoreStatus(statusRaw) ? statusRaw : null,
    assignedTo: assignedRaw || null,
    dueDate: dueDateRaw || null,
    recurrence: isValidChoreRecurrence(recurrenceRaw) ? recurrenceRaw : null,
  };
}
