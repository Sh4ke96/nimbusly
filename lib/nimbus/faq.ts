export const NIMBUS_FAQ_ID = {
  ADD_FAMILY_MEMBER: "addFamilyMember",
  CHANGE_AVATAR: "changeAvatar",
  ADD_BUDGET: "addBudget",
  SHOPPING_LIST: "shoppingList",
  URGENT_NOTE: "urgentNote",
  HIDE_NIMBUS: "hideNimbus",
  QUIET_MODE: "quietMode",
  FAMILY_REALTIME: "familyRealtime",
  ASSIGN_CHORE: "assignChore",
  SCHEDULE_BIRTHDAYS: "scheduleBirthdays",
  NIMBUS_TOUR: "nimbusTour",
  NOTIFICATIONS: "notifications",
  GLOBAL_SEARCH: "globalSearch",
  DASHBOARD_LAYOUT: "dashboardLayout",
  ATTENTION_PIN: "attentionPin",
  EXPORT_CSV: "exportCsv",
  WATCH_DASHBOARD: "watchDashboard",
  SHOPPING_CATEGORIES: "shoppingCategories",
  JOIN_FAMILY: "joinFamily",
  CREATE_FAMILY: "createFamily",
  LEAVE_FAMILY: "leaveFamily",
  MANAGE_FAMILY_ROLES: "manageFamilyRoles",
  ACCOUNT_TYPE_SETUP: "accountTypeSetup",
} as const;

export type NimbusFaqId = (typeof NIMBUS_FAQ_ID)[keyof typeof NIMBUS_FAQ_ID];

export const NIMBUS_FAQ_IDS = Object.values(NIMBUS_FAQ_ID) as NimbusFaqId[];

export const NIMBUS_FAQ_HREF: Record<NimbusFaqId, string> = {
  [NIMBUS_FAQ_ID.ADD_FAMILY_MEMBER]: "/family",
  [NIMBUS_FAQ_ID.CHANGE_AVATAR]: "/profile/settings?tab=profile",
  [NIMBUS_FAQ_ID.ADD_BUDGET]: "/budget",
  [NIMBUS_FAQ_ID.SHOPPING_LIST]: "/shopping",
  [NIMBUS_FAQ_ID.URGENT_NOTE]: "/notes",
  [NIMBUS_FAQ_ID.HIDE_NIMBUS]: "/profile/settings?tab=profile",
  [NIMBUS_FAQ_ID.QUIET_MODE]: "/profile/settings?tab=profile",
  [NIMBUS_FAQ_ID.FAMILY_REALTIME]: "/shopping",
  [NIMBUS_FAQ_ID.ASSIGN_CHORE]: "/chores",
  [NIMBUS_FAQ_ID.SCHEDULE_BIRTHDAYS]: "/birthdays",
  [NIMBUS_FAQ_ID.NIMBUS_TOUR]: "/dashboard",
  [NIMBUS_FAQ_ID.NOTIFICATIONS]: "/notifications",
  [NIMBUS_FAQ_ID.GLOBAL_SEARCH]: "/dashboard",
  [NIMBUS_FAQ_ID.DASHBOARD_LAYOUT]: "/dashboard",
  [NIMBUS_FAQ_ID.ATTENTION_PIN]: "/dashboard",
  [NIMBUS_FAQ_ID.EXPORT_CSV]: "/budget",
  [NIMBUS_FAQ_ID.WATCH_DASHBOARD]: "/dashboard",
  [NIMBUS_FAQ_ID.SHOPPING_CATEGORIES]: "/profile/settings?tab=shopping-categories",
  [NIMBUS_FAQ_ID.JOIN_FAMILY]: "/profile/settings?tab=account#join-family",
  [NIMBUS_FAQ_ID.CREATE_FAMILY]: "/profile/settings?tab=account",
  [NIMBUS_FAQ_ID.LEAVE_FAMILY]: "/family",
  [NIMBUS_FAQ_ID.MANAGE_FAMILY_ROLES]: "/family",
  [NIMBUS_FAQ_ID.ACCOUNT_TYPE_SETUP]: "/profile/settings?tab=account",
};

export const NIMBUS_FAQ_MODULE_LABEL_KEY: Record<
  NimbusFaqId,
  | "settings"
  | "budget"
  | "shopping"
  | "notes"
  | "chores"
  | "birthdays"
  | "dashboard"
  | "notifications"
  | "search"
> = {
  [NIMBUS_FAQ_ID.ADD_FAMILY_MEMBER]: "settings",
  [NIMBUS_FAQ_ID.CHANGE_AVATAR]: "settings",
  [NIMBUS_FAQ_ID.ADD_BUDGET]: "budget",
  [NIMBUS_FAQ_ID.SHOPPING_LIST]: "shopping",
  [NIMBUS_FAQ_ID.URGENT_NOTE]: "notes",
  [NIMBUS_FAQ_ID.HIDE_NIMBUS]: "settings",
  [NIMBUS_FAQ_ID.QUIET_MODE]: "settings",
  [NIMBUS_FAQ_ID.FAMILY_REALTIME]: "shopping",
  [NIMBUS_FAQ_ID.ASSIGN_CHORE]: "chores",
  [NIMBUS_FAQ_ID.SCHEDULE_BIRTHDAYS]: "birthdays",
  [NIMBUS_FAQ_ID.NIMBUS_TOUR]: "dashboard",
  [NIMBUS_FAQ_ID.NOTIFICATIONS]: "notifications",
  [NIMBUS_FAQ_ID.GLOBAL_SEARCH]: "search",
  [NIMBUS_FAQ_ID.DASHBOARD_LAYOUT]: "dashboard",
  [NIMBUS_FAQ_ID.ATTENTION_PIN]: "dashboard",
  [NIMBUS_FAQ_ID.EXPORT_CSV]: "budget",
  [NIMBUS_FAQ_ID.WATCH_DASHBOARD]: "dashboard",
  [NIMBUS_FAQ_ID.SHOPPING_CATEGORIES]: "settings",
  [NIMBUS_FAQ_ID.JOIN_FAMILY]: "settings",
  [NIMBUS_FAQ_ID.CREATE_FAMILY]: "settings",
  [NIMBUS_FAQ_ID.LEAVE_FAMILY]: "settings",
  [NIMBUS_FAQ_ID.MANAGE_FAMILY_ROLES]: "settings",
  [NIMBUS_FAQ_ID.ACCOUNT_TYPE_SETUP]: "settings",
};
