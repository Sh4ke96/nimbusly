/** Cypress / test harness seed kinds (not DB values). */
export const TEST_USER_SEED_KIND = {
  PENDING: "pending",
  ONBOARDED: "onboarded",
} as const;

export type TestUserSeedKind =
  (typeof TEST_USER_SEED_KIND)[keyof typeof TEST_USER_SEED_KIND];
