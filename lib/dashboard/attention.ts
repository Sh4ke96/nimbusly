import type { BirthdayEntry } from "@/lib/birthdays/types";
import { daysUntilBirthday } from "@/lib/dashboard/birthdays";
import type { ChoreTask } from "@/lib/chores/types";
import { isChoreOverdue } from "@/lib/chores/filters";
import { isMedicineExpiringSoon } from "@/lib/medicine/expiry";
import type { MedicineItem } from "@/lib/medicine/types";
import { isPetCareDueSoon } from "@/lib/pets/due";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import { resolvePetName } from "@/lib/pets/filters";

export const ATTENTION_KIND = {
  CHORE_OVERDUE: "chore_overdue",
  MEDICINE_EXPIRING: "medicine_expiring",
  PET_CARE_DUE: "pet_care_due",
  BIRTHDAY_SOON: "birthday_soon",
} as const;

export type AttentionKind = (typeof ATTENTION_KIND)[keyof typeof ATTENTION_KIND];

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
  labels: {
    choreOverdue: (title: string) => string;
    medicineExpiring: (name: string) => string;
    petCareDue: (petName: string, itemName: string) => string;
    birthdaySoon: (name: string, when: string) => string;
    birthdayToday: string;
    birthdayInDays: (count: string) => string;
  };
  limit?: number;
}): AttentionItem[] {
  const items: AttentionItem[] = [];
  const limit = params.limit ?? 8;

  for (const task of params.choreTasks) {
    if (!isChoreOverdue(task)) continue;
    items.push({
      kind: ATTENTION_KIND.CHORE_OVERDUE,
      href: "/chores",
      label: params.labels.choreOverdue(task.title),
    });
  }

  for (const medicine of params.medicineItems) {
    if (!isMedicineExpiringSoon(medicine.expiry_date)) continue;
    items.push({
      kind: ATTENTION_KIND.MEDICINE_EXPIRING,
      href: "/medicine-cabinet",
      label: params.labels.medicineExpiring(medicine.name),
    });
  }

  for (const care of params.careItems) {
    if (!isPetCareDueSoon(care.next_due_date)) continue;
    const petName = resolvePetName(params.pets, care.pet_id);
    items.push({
      kind: ATTENTION_KIND.PET_CARE_DUE,
      href: "/pets",
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
      href: "/birthdays",
      label: params.labels.birthdaySoon(birthday.person_name, when),
    });
  }

  return items.slice(0, limit);
}

export function countAttentionItems(items: AttentionItem[]): number {
  return items.length;
}
