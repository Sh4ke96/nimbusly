/** Demo family member keys for landing page avatars (not DB roles). */
export const DEMO_MEMBER_ROLE = {
  MOM: "mama",
  DAD: "tata",
  DAUGHTER: "corka",
  SON: "syn",
} as const;

export type DemoMemberRole = (typeof DEMO_MEMBER_ROLE)[keyof typeof DEMO_MEMBER_ROLE];
