import { DASHBOARD_VIEW } from "@/lib/constants/dashboard";
import {
  MOBILE_NAV_ITEM,
  type MobileNavItem,
} from "@/lib/constants/mobile-nav";

export function isMobileNavActive(
  pathname: string,
  search: string,
  item: MobileNavItem
): boolean {
  const view = new URLSearchParams(search).get("view");

  if (item === MOBILE_NAV_ITEM.HOME) {
    return pathname === "/dashboard" && view !== DASHBOARD_VIEW.MODULES;
  }
  if (item === MOBILE_NAV_ITEM.MODULES) {
    return pathname === "/dashboard" && view === DASHBOARD_VIEW.MODULES;
  }
  if (item === MOBILE_NAV_ITEM.NOTIFICATIONS) {
    return pathname === "/notifications";
  }
  return pathname.startsWith("/profile/settings");
}
