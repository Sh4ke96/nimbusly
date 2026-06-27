export const MOBILE_NAV_ITEM = {
  HOME: "home",
  MODULES: "modules",
  NOTIFICATIONS: "notifications",
  SETTINGS: "settings",
} as const;

export type MobileNavItem = (typeof MOBILE_NAV_ITEM)[keyof typeof MOBILE_NAV_ITEM];

export const MOBILE_NAV_HREF = {
  [MOBILE_NAV_ITEM.HOME]: "/dashboard",
  [MOBILE_NAV_ITEM.MODULES]: "/dashboard?view=modules",
  [MOBILE_NAV_ITEM.NOTIFICATIONS]: "/notifications",
  [MOBILE_NAV_ITEM.SETTINGS]: "/profile/settings",
} as const satisfies Record<MobileNavItem, string>;
