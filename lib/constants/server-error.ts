export const FAMILY_ACCESS_ERROR = {
  UNAUTHORIZED: "unauthorized",
  NO_FAMILY: "no_family",
  NOT_OWNER: "not_owner",
  NOT_ADMIN: "not_admin",
} as const;

export type FamilyAccessError =
  (typeof FAMILY_ACCESS_ERROR)[keyof typeof FAMILY_ACCESS_ERROR];
