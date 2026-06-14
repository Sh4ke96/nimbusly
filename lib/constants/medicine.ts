export const MEDICINE_FORM_TYPE = {
  TABLETS: "tablets",
  SYRUP: "syrup",
  DROPS: "drops",
  CREAM: "cream",
  PATCH: "patch",
  SPRAY: "spray",
  OTHER: "other",
} as const;

export const MEDICINE_FORM_TYPES = [
  MEDICINE_FORM_TYPE.TABLETS,
  MEDICINE_FORM_TYPE.SYRUP,
  MEDICINE_FORM_TYPE.DROPS,
  MEDICINE_FORM_TYPE.CREAM,
  MEDICINE_FORM_TYPE.PATCH,
  MEDICINE_FORM_TYPE.SPRAY,
  MEDICINE_FORM_TYPE.OTHER,
] as const;

export type MedicineFormType = (typeof MEDICINE_FORM_TYPES)[number];

export const MEDICINE_AVAILABILITY = {
  IN_STOCK: "in_stock",
  LOW: "low",
  OUT_OF_STOCK: "out_of_stock",
  TO_BUY: "to_buy",
} as const;

export const MEDICINE_AVAILABILITIES = [
  MEDICINE_AVAILABILITY.IN_STOCK,
  MEDICINE_AVAILABILITY.LOW,
  MEDICINE_AVAILABILITY.OUT_OF_STOCK,
  MEDICINE_AVAILABILITY.TO_BUY,
] as const;

export type MedicineAvailability = (typeof MEDICINE_AVAILABILITIES)[number];

export const MEDICINE_FILTER_ALL = "all";

export const MEDICINE_NAME_MAX_LENGTH = 120;
export const MEDICINE_QUANTITY_MAX_LENGTH = 80;
export const MEDICINE_LOCATION_MAX_LENGTH = 80;
export const MEDICINE_NOTES_MAX_LENGTH = 500;

export const MEDICINE_EXPIRY_WARNING_DAYS = 30;

export const MEDICINE_EXPIRY_STATUS = {
  NONE: "none",
  OK: "ok",
  WARNING: "warning",
  EXPIRED: "expired",
} as const;

export type MedicineExpiryStatus =
  (typeof MEDICINE_EXPIRY_STATUS)[keyof typeof MEDICINE_EXPIRY_STATUS];
