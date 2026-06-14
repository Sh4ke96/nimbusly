import {
  PET_CARE_NAME_MAX_LENGTH,
  PET_CARE_NOTES_MAX_LENGTH,
  PET_CARE_QUANTITY_MAX_LENGTH,
  PET_CARE_STOCK_TYPES,
  PET_CARE_TYPES,
  PET_NAME_MAX_LENGTH,
  PET_NOTES_MAX_LENGTH,
  PET_SPECIES_LIST,
  PET_STOCK_STATUSES,
  type PetCareType,
  type PetSpecies,
  type PetStockStatus,
} from "@/lib/constants/pets";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import { getFormString, getFormTrimmedString } from "@/lib/form/values";

export interface Pet {
  id: string;
  family_id: string | null;
  name: string;
  species: PetSpecies;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PetCareItem {
  id: string;
  pet_id: string;
  family_id: string | null;
  name: string;
  care_type: PetCareType;
  last_done_at: string | null;
  next_due_date: string | null;
  stock_status: PetStockStatus | null;
  quantity: string;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function isPetCareStockType(careType: PetCareType): boolean {
  return (PET_CARE_STOCK_TYPES as string[]).includes(careType);
}

export function normalizePetName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function isValidPetName(name: string): boolean {
  const normalized = normalizePetName(name);
  return normalized.length > 0 && normalized.length <= PET_NAME_MAX_LENGTH;
}

export function isValidPetSpecies(value: string): value is PetSpecies {
  return PET_SPECIES_LIST.includes(value as PetSpecies);
}

export function isValidPetNotes(notes: string): boolean {
  return notes.length <= PET_NOTES_MAX_LENGTH;
}

export function isValidPetCareName(name: string): boolean {
  const normalized = normalizePetName(name);
  return normalized.length > 0 && normalized.length <= PET_CARE_NAME_MAX_LENGTH;
}

export function isValidPetCareType(value: string): value is PetCareType {
  return PET_CARE_TYPES.includes(value as PetCareType);
}

export function isValidPetStockStatus(value: string | null): value is PetStockStatus {
  if (value === null) return true;
  return PET_STOCK_STATUSES.includes(value as PetStockStatus);
}

export function isValidPetCareQuantity(quantity: string): boolean {
  return quantity.length <= PET_CARE_QUANTITY_MAX_LENGTH;
}

export function isValidPetCareNotes(notes: string): boolean {
  return notes.length <= PET_CARE_NOTES_MAX_LENGTH;
}

export function dateToPetDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parsePetDateString(value: string | null | undefined): Date | undefined {
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

export function isValidPetDateString(value: string | null | undefined): boolean {
  if (!value) return true;
  return parsePetDateString(value) !== undefined;
}

export function validatePetCareFields(
  careType: PetCareType,
  stockStatus: PetStockStatus | null
): "stockStatus" | null {
  if (isPetCareStockType(careType) && !stockStatus) {
    return "stockStatus";
  }
  return null;
}

export const PET_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  NAME: "name",
  SPECIES: "species",
  NOTES: "notes",
  PET_ID: "petId",
  CARE_TYPE: "careType",
  LAST_DONE_AT: "lastDoneAt",
  NEXT_DUE_DATE: "nextDueDate",
  STOCK_STATUS: "stockStatus",
  QUANTITY: "quantity",
} as const;

export function parsePetIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, PET_FORM_FIELD.ID);
}

export function parsePetFromForm(formData: FormData): {
  name: string;
  species: PetSpecies | null;
  notes: string;
} {
  const name = normalizePetName(getFormString(formData, PET_FORM_FIELD.NAME));
  const speciesRaw = getFormTrimmedString(formData, PET_FORM_FIELD.SPECIES);
  const notes = getFormTrimmedString(formData, PET_FORM_FIELD.NOTES);

  return {
    name,
    species: isValidPetSpecies(speciesRaw) ? speciesRaw : null,
    notes,
  };
}

export function parsePetCareItemFromForm(formData: FormData): {
  petId: string;
  name: string;
  careType: PetCareType | null;
  lastDoneAt: string | null;
  nextDueDate: string | null;
  stockStatus: PetStockStatus | null;
  quantity: string;
  notes: string;
} {
  const petId = getFormTrimmedString(formData, PET_FORM_FIELD.PET_ID);
  const name = normalizePetName(getFormString(formData, PET_FORM_FIELD.NAME));
  const careTypeRaw = getFormTrimmedString(formData, PET_FORM_FIELD.CARE_TYPE);
  const lastDoneRaw = getFormTrimmedString(formData, PET_FORM_FIELD.LAST_DONE_AT);
  const nextDueRaw = getFormTrimmedString(formData, PET_FORM_FIELD.NEXT_DUE_DATE);
  const stockRaw = getFormTrimmedString(formData, PET_FORM_FIELD.STOCK_STATUS);
  const quantity = getFormTrimmedString(formData, PET_FORM_FIELD.QUANTITY);
  const notes = getFormTrimmedString(formData, PET_FORM_FIELD.NOTES);

  return {
    petId,
    name,
    careType: isValidPetCareType(careTypeRaw) ? careTypeRaw : null,
    lastDoneAt: lastDoneRaw || null,
    nextDueDate: nextDueRaw || null,
    stockStatus:
      stockRaw && isValidPetStockStatus(stockRaw) ? (stockRaw as PetStockStatus) : null,
    quantity,
    notes,
  };
}
