import type { BirthdayEntry } from "@/lib/birthdays/types";

export function daysUntilBirthday(
  month: number,
  day: number,
  from = new Date()
): number {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(from.getFullYear(), month - 1, day);
  if (next < today) {
    next = new Date(from.getFullYear() + 1, month - 1, day);
  }
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

export function sortBirthdaysByUpcoming(
  entries: BirthdayEntry[],
  from = new Date()
): BirthdayEntry[] {
  return [...entries].sort(
    (a, b) =>
      daysUntilBirthday(a.birth_month, a.birth_day, from) -
      daysUntilBirthday(b.birth_month, b.birth_day, from)
  );
}
