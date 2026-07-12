import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import {
  getFormNumber,
  getFormTrimmedString,
} from "@/lib/form/values";

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

export function formatBirthdayLabel(
  entry: Pick<BirthdayEntry, "birth_month" | "birth_day"> & {
    birth_year?: number | null;
  }
): string {
  const day = String(entry.birth_day).padStart(2, "0");
  const month = String(entry.birth_month).padStart(2, "0");
  if (entry.birth_year) {
    return `${day}.${month}.${entry.birth_year}`;
  }
  return `${day}.${month}`;
}

export function isValidBirthYear(year: number | null): boolean {
  if (year === null) return true;
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= 1900 && year <= currentYear;
}

export function computeBirthdayAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

export const BIRTHDAY_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  PERSON_NAME: "personName",
  BIRTH_MONTH: "birthMonth",
  BIRTH_DAY: "birthDay",
  BIRTH_YEAR: "birthYear",
  INCLUDE_BIRTH_YEAR: "includeBirthYear",
  DESCRIPTION: "description",
} as const;

function parseBirthYearFromForm(formData: FormData): number | null {
  const includeYear = formData.get(BIRTHDAY_FORM_FIELD.INCLUDE_BIRTH_YEAR) === "true";
  if (!includeYear) return null;

  const raw = getFormTrimmedString(formData, BIRTHDAY_FORM_FIELD.BIRTH_YEAR);
  if (!raw) return null;

  const year = Number.parseInt(raw, 10);
  if (!Number.isFinite(year)) return null;
  return year;
}

export function parseBirthdayFromForm(formData: FormData): {
  personName: string;
  birthMonth: number;
  birthDay: number;
  birthYear: number | null;
  description: string;
} {
  return {
    personName: getFormTrimmedString(formData, BIRTHDAY_FORM_FIELD.PERSON_NAME),
    birthMonth: getFormNumber(formData, BIRTHDAY_FORM_FIELD.BIRTH_MONTH),
    birthDay: getFormNumber(formData, BIRTHDAY_FORM_FIELD.BIRTH_DAY),
    birthYear: parseBirthYearFromForm(formData),
    description: getFormTrimmedString(formData, BIRTHDAY_FORM_FIELD.DESCRIPTION),
  };
}

export function parseBirthdayIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, BIRTHDAY_FORM_FIELD.ID);
}
