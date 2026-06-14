import {
  MEDICINE_AVAILABILITIES,
  MEDICINE_FORM_TYPES,
  MEDICINE_LOCATION_MAX_LENGTH,
  MEDICINE_NAME_MAX_LENGTH,
  MEDICINE_NOTES_MAX_LENGTH,
  MEDICINE_QUANTITY_MAX_LENGTH,
  type MedicineAvailability,
  type MedicineFormType,
} from "@/lib/constants/medicine";

export interface MedicineItem {
  id: string;
  family_id: string | null;
  name: string;
  form_type: MedicineFormType;
  quantity: string;
  expiry_date: string | null;
  availability: MedicineAvailability;
  location: string;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function normalizeMedicineName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function isValidMedicineName(name: string): boolean {
  const normalized = normalizeMedicineName(name);
  return normalized.length > 0 && normalized.length <= MEDICINE_NAME_MAX_LENGTH;
}

export function isValidMedicineFormType(value: string): value is MedicineFormType {
  return MEDICINE_FORM_TYPES.includes(value as MedicineFormType);
}

export function isValidMedicineAvailability(
  value: string
): value is MedicineAvailability {
  return MEDICINE_AVAILABILITIES.includes(value as MedicineAvailability);
}

export function isValidMedicineQuantity(quantity: string): boolean {
  return quantity.length <= MEDICINE_QUANTITY_MAX_LENGTH;
}

export function isValidMedicineLocation(location: string): boolean {
  return location.length <= MEDICINE_LOCATION_MAX_LENGTH;
}

export function isValidMedicineNotes(notes: string): boolean {
  return notes.length <= MEDICINE_NOTES_MAX_LENGTH;
}

export function dateToMedicineDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseMedicineDateString(value: string | null | undefined): Date | undefined {
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

export function isValidMedicineExpiryDate(value: string | null | undefined): boolean {
  if (!value) return true;
  return parseMedicineDateString(value) !== undefined;
}

export function parseMedicineItemFromForm(formData: FormData): {
  name: string;
  formType: MedicineFormType | null;
  quantity: string;
  expiryDate: string | null;
  availability: MedicineAvailability | null;
  location: string;
  notes: string;
} {
  const name = normalizeMedicineName((formData.get("name") as string) ?? "");
  const formTypeRaw = (formData.get("formType") as string)?.trim() ?? "";
  const quantity = ((formData.get("quantity") as string) ?? "").trim();
  const expiryDateRaw = (formData.get("expiryDate") as string)?.trim() || null;
  const availabilityRaw = (formData.get("availability") as string)?.trim() ?? "";
  const location = ((formData.get("location") as string) ?? "").trim();
  const notes = ((formData.get("notes") as string) ?? "").trim();

  return {
    name,
    formType: isValidMedicineFormType(formTypeRaw) ? formTypeRaw : null,
    quantity,
    expiryDate: expiryDateRaw,
    availability: isValidMedicineAvailability(availabilityRaw) ? availabilityRaw : null,
    location,
    notes,
  };
}
