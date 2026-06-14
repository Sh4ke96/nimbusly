export interface BirthdayEntry {
  id: string;
  family_id: string | null;
  person_name: string;
  birth_month: number;
  birth_day: number;
  birth_year: number | null;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BirthdayFormValues {
  personName: string;
  birthMonth: number;
  birthDay: number;
  birthYear: string;
  description: string;
}

export function isValidBirthDate(month: number, day: number, year?: number | null): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const y = year ?? 2000;
  const date = new Date(y, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day;
}

export function birthdayDateKey(month: number, day: number): string {
  return `${month}-${day}`;
}

export function formatBirthdayLabel(entry: Pick<BirthdayEntry, "birth_month" | "birth_day">): string {
  const day = String(entry.birth_day).padStart(2, "0");
  const month = String(entry.birth_month).padStart(2, "0");
  return `${day}.${month}`;
}
