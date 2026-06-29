export const SETTINGS_TAB = {
  PROFILE: "profile",
  ACCOUNT: "account",
  NOTIFICATIONS: "notifications",
  FAMILY: "family",
  PERMISSIONS: "permissions",
  SHOPPING_CATEGORIES: "shopping-categories",
  PASSWORD: "password",
} as const;

export type SettingsTab = (typeof SETTINGS_TAB)[keyof typeof SETTINGS_TAB];

export const SETTINGS_TABS = Object.values(SETTINGS_TAB) as SettingsTab[];

export const SETTINGS_TAB_DEFAULT = SETTINGS_TAB.PROFILE;
