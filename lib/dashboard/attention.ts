import type { BirthdayEntry } from "@/lib/birthdays/types";
import { isBudgetPaymentDueSoon } from "@/lib/budget/attention";
import type { BudgetExpense } from "@/lib/budget/types";
import { APP_MODULE, APP_MODULE_ROUTES, type AppModuleId } from "@/lib/constants/app-modules";
import { daysUntilBirthday } from "@/lib/dashboard/birthdays";
import type { ChoreTask } from "@/lib/chores/types";
import { isChoreOverdue } from "@/lib/chores/filters";
import { isMedicineExpiringSoon } from "@/lib/medicine/expiry";
import type { MedicineItem } from "@/lib/medicine/types";
import { formatUrgentNoteTitle, isNoteMarkedUrgent } from "@/lib/notes/attention";
import type { Note } from "@/lib/notes/types";
import { isPetCareDueSoon } from "@/lib/pets/due";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import { resolvePetName } from "@/lib/pets/filters";
import { isScheduleEntryEndingSoon } from "@/lib/schedule/attention";
import type { ScheduleEntry } from "@/lib/schedule/types";

export const ATTENTION_KIND = {
  CHORE_OVERDUE: "chore_overdue",
  MEDICINE_EXPIRING: "medicine_expiring",
  PET_CARE_DUE: "pet_care_due",
  BIRTHDAY_SOON: "birthday_soon",
  BUDGET_PAYMENT_DUE: "budget_payment_due",
  SCHEDULE_ENDING: "schedule_ending",
  NOTE_URGENT: "note_urgent",
} as const;

export type AttentionKind = (typeof ATTENTION_KIND)[keyof typeof ATTENTION_KIND];

export const ATTENTION_KIND_MODULE: Record<AttentionKind, AppModuleId> = {
  [ATTENTION_KIND.CHORE_OVERDUE]: APP_MODULE.CHORES,
  [ATTENTION_KIND.MEDICINE_EXPIRING]: APP_MODULE.MEDICINE_CABINET,
  [ATTENTION_KIND.PET_CARE_DUE]: APP_MODULE.PETS,
  [ATTENTION_KIND.BIRTHDAY_SOON]: APP_MODULE.BIRTHDAYS,
  [ATTENTION_KIND.BUDGET_PAYMENT_DUE]: APP_MODULE.BUDGET,
  [ATTENTION_KIND.SCHEDULE_ENDING]: APP_MODULE.CALENDAR,
  [ATTENTION_KIND.NOTE_URGENT]: APP_MODULE.NOTES,
};

export function getAttentionModuleId(kind: AttentionKind): AppModuleId {
  return ATTENTION_KIND_MODULE[kind];
}

export interface AttentionItem {
  kind: AttentionKind;
  href: string;
  label: string;
  detail?: string;
}

const BIRTHDAY_ATTENTION_DAYS = 14;

export function buildAttentionItems(params: {
  choreTasks: ChoreTask[];
  medicineItems: MedicineItem[];
  careItems: PetCareItem[];
  pets: Pet[];
  birthdays: BirthdayEntry[];
  budgetExpenses?: BudgetExpense[];
  scheduleEntries?: ScheduleEntry[];
  notes?: Note[];
  labels: {
    choreOverdue: (title: string) => string;
    medicineExpiring: (name: string) => string;
    petCareDue: (pet: string, item: string) => string;
    birthdaySoon: (name: string, when: string) => string;
    birthdayToday: string;
    birthdayInDays: (count: string) => string;
    budgetPaymentDue: (description: string) => string;
    scheduleEnding: (description: string) => string;
    noteUrgent: (title: string) => string;
  };
  limit?: number;
}): AttentionItem[] {
  const items: AttentionItem[] = [];
  const limit = params.limit ?? 8;

  for (const task of params.choreTasks) {
    if (!isChoreOverdue(task)) continue;
    items.push({
      kind: ATTENTION_KIND.CHORE_OVERDUE,
      href: APP_MODULE_ROUTES[APP_MODULE.CHORES],
      label: params.labels.choreOverdue(task.title),
    });
  }

  for (const medicine of params.medicineItems) {
    if (!isMedicineExpiringSoon(medicine.expiry_date)) continue;
    items.push({
      kind: ATTENTION_KIND.MEDICINE_EXPIRING,
      href: APP_MODULE_ROUTES[APP_MODULE.MEDICINE_CABINET],
      label: params.labels.medicineExpiring(medicine.name),
    });
  }

  for (const care of params.careItems) {
    if (!isPetCareDueSoon(care.next_due_date)) continue;
    const petName = resolvePetName(params.pets, care.pet_id);
    items.push({
      kind: ATTENTION_KIND.PET_CARE_DUE,
      href: APP_MODULE_ROUTES[APP_MODULE.PETS],
      label: params.labels.petCareDue(petName, care.name),
    });
  }

  for (const birthday of params.birthdays) {
    const days = daysUntilBirthday(birthday.birth_month, birthday.birth_day);
    if (days > BIRTHDAY_ATTENTION_DAYS) continue;
    const when =
      days === 0
        ? params.labels.birthdayToday
        : params.labels.birthdayInDays(String(days));
    items.push({
      kind: ATTENTION_KIND.BIRTHDAY_SOON,
      href: APP_MODULE_ROUTES[APP_MODULE.BIRTHDAYS],
      label: params.labels.birthdaySoon(birthday.person_name, when),
    });
  }

  for (const expense of params.budgetExpenses ?? []) {
    if (!isBudgetPaymentDueSoon(expense)) continue;
    const description = expense.description.trim() || expense.category;
    items.push({
      kind: ATTENTION_KIND.BUDGET_PAYMENT_DUE,
      href: APP_MODULE_ROUTES[APP_MODULE.BUDGET],
      label: params.labels.budgetPaymentDue(description),
    });
  }

  for (const entry of params.scheduleEntries ?? []) {
    if (!isScheduleEntryEndingSoon(entry)) continue;
    const description = entry.description.trim() || entry.entry_type;
    items.push({
      kind: ATTENTION_KIND.SCHEDULE_ENDING,
      href: APP_MODULE_ROUTES[APP_MODULE.CALENDAR],
      label: params.labels.scheduleEnding(description),
    });
  }

  for (const note of params.notes ?? []) {
    if (!isNoteMarkedUrgent(note)) continue;
    items.push({
      kind: ATTENTION_KIND.NOTE_URGENT,
      href: APP_MODULE_ROUTES[APP_MODULE.NOTES],
      label: params.labels.noteUrgent(formatUrgentNoteTitle(note.title)),
    });
  }

  return items.sort(
    (a, b) => getAttentionPriority(a.kind) - getAttentionPriority(b.kind)
  ).slice(0, limit);
}

const ATTENTION_PRIORITY: Record<AttentionKind, number> = {
  [ATTENTION_KIND.NOTE_URGENT]: 0,
  [ATTENTION_KIND.CHORE_OVERDUE]: 1,
  [ATTENTION_KIND.BUDGET_PAYMENT_DUE]: 2,
  [ATTENTION_KIND.MEDICINE_EXPIRING]: 3,
  [ATTENTION_KIND.PET_CARE_DUE]: 4,
  [ATTENTION_KIND.SCHEDULE_ENDING]: 5,
  [ATTENTION_KIND.BIRTHDAY_SOON]: 6,
};

export function getAttentionPriority(kind: AttentionKind): number {
  return ATTENTION_PRIORITY[kind];
}

export function isPinnedAttentionItem(kind: AttentionKind): boolean {
  return kind === ATTENTION_KIND.NOTE_URGENT;
}

export function countAttentionItems(items: AttentionItem[]): number {
  return items.length;
}
