export const PET_SPECIES = {
  DOG: "dog",
  CAT: "cat",
  BIRD: "bird",
  OTHER: "other",
} as const;

export const PET_SPECIES_LIST = [
  PET_SPECIES.DOG,
  PET_SPECIES.CAT,
  PET_SPECIES.BIRD,
  PET_SPECIES.OTHER,
] as const;

export type PetSpecies = (typeof PET_SPECIES_LIST)[number];

export const PET_CARE_TYPE = {
  VACCINATION: "vaccination",
  VET_VISIT: "vet_visit",
  DEWORMING: "deworming",
  MEDICATION: "medication",
  FOOD: "food",
  OTHER: "other",
} as const;

export const PET_CARE_TYPES = [
  PET_CARE_TYPE.VACCINATION,
  PET_CARE_TYPE.VET_VISIT,
  PET_CARE_TYPE.DEWORMING,
  PET_CARE_TYPE.MEDICATION,
  PET_CARE_TYPE.FOOD,
  PET_CARE_TYPE.OTHER,
] as const;

export type PetCareType = (typeof PET_CARE_TYPES)[number];

export const PET_CARE_STOCK_TYPES: PetCareType[] = [
  PET_CARE_TYPE.MEDICATION,
  PET_CARE_TYPE.FOOD,
];

export const PET_STOCK_STATUS = {
  IN_STOCK: "in_stock",
  LOW: "low",
  OUT_OF_STOCK: "out_of_stock",
  TO_BUY: "to_buy",
} as const;

export const PET_STOCK_STATUSES = [
  PET_STOCK_STATUS.IN_STOCK,
  PET_STOCK_STATUS.LOW,
  PET_STOCK_STATUS.OUT_OF_STOCK,
  PET_STOCK_STATUS.TO_BUY,
] as const;

export type PetStockStatus = (typeof PET_STOCK_STATUSES)[number];

export const PET_FILTER_ALL = "all";

export const PET_NAME_MAX_LENGTH = 80;
export const PET_NOTES_MAX_LENGTH = 500;
export const PET_CARE_NAME_MAX_LENGTH = 120;
export const PET_CARE_QUANTITY_MAX_LENGTH = 80;
export const PET_CARE_NOTES_MAX_LENGTH = 500;

export const PET_DUE_WARNING_DAYS = 30;

export const PET_DUE_STATUS = {
  NONE: "none",
  OK: "ok",
  WARNING: "warning",
  OVERDUE: "overdue",
} as const;

export type PetDueStatus = (typeof PET_DUE_STATUS)[keyof typeof PET_DUE_STATUS];
