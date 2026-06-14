import { PET_DUE_STATUS, PET_DUE_WARNING_DAYS } from "@/lib/constants/pets";
import type { PetDueStatus } from "@/lib/constants/pets";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

export function daysUntilDue(
  dueDate: string | null,
  today: Date = new Date()
): number | null {
  if (!dueDate) return null;
  const parsed = parseDueDate(dueDate);
  if (!parsed) return null;
  const start = startOfDay(today);
  const end = startOfDay(parsed);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function parseDueDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
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

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getPetDueStatus(
  dueDate: string | null,
  today: Date = new Date(),
  warningDays = PET_DUE_WARNING_DAYS
): PetDueStatus {
  if (!dueDate) return PET_DUE_STATUS.NONE;
  const days = daysUntilDue(dueDate, today);
  if (days === null) return PET_DUE_STATUS.NONE;
  if (days < 0) return PET_DUE_STATUS.OVERDUE;
  if (days <= warningDays) return PET_DUE_STATUS.WARNING;
  return PET_DUE_STATUS.OK;
}

export function isPetCareDueSoon(
  dueDate: string | null,
  today: Date = new Date(),
  warningDays = PET_DUE_WARNING_DAYS
): boolean {
  const status = getPetDueStatus(dueDate, today, warningDays);
  return status === PET_DUE_STATUS.WARNING || status === PET_DUE_STATUS.OVERDUE;
}

export function formatPetDueCountdown(
  dueDate: string | null,
  labels: Pick<Dict["pets"], "dueToday" | "dueInDays" | "dueOverdue" | "dueSoon">,
  today: Date = new Date()
): string | null {
  const status = getPetDueStatus(dueDate, today);
  if (status === PET_DUE_STATUS.NONE || status === PET_DUE_STATUS.OK) {
    return null;
  }
  if (status === PET_DUE_STATUS.OVERDUE) {
    return labels.dueOverdue;
  }
  const days = daysUntilDue(dueDate, today);
  if (days === 0) return labels.dueToday;
  if (days !== null && days > 0) {
    return formatMessage(labels.dueInDays, { count: String(days) });
  }
  return labels.dueSoon;
}

export function sortPetCareByDue<T extends { next_due_date: string | null; name: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    if (a.next_due_date && b.next_due_date) {
      return a.next_due_date.localeCompare(b.next_due_date);
    }
    if (a.next_due_date) return -1;
    if (b.next_due_date) return 1;
    return a.name.localeCompare(b.name);
  });
}
