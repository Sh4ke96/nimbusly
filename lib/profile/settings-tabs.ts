import { NIMBUS_SETTINGS_TAB_EVENT } from "@/lib/constants/nimbus";
import {
  SETTINGS_TAB,
  SETTINGS_TAB_DEFAULT,
  SETTINGS_TABS,
  type SettingsTab,
} from "@/lib/constants/settings";

export type { SettingsTab };

export function parseSettingsTab(value: string | null): SettingsTab {
  if (value === SETTINGS_TAB.PERMISSIONS) {
    return SETTINGS_TAB.FAMILY;
  }
  if (value && SETTINGS_TABS.includes(value as SettingsTab)) {
    return value as SettingsTab;
  }
  return SETTINGS_TAB_DEFAULT;
}

export function settingsTabHref(tab: SettingsTab) {
  return `/profile/settings?tab=${tab}`;
}

export function navigateSettingsTab(tab: SettingsTab, pathname: string, hash = "") {
  if (pathname !== "/profile/settings") return false;

  window.history.replaceState(window.history.state, "", `${settingsTabHref(tab)}${hash}`);
  window.dispatchEvent(new CustomEvent(NIMBUS_SETTINGS_TAB_EVENT, { detail: tab }));

  if (hash.startsWith("#")) {
    requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return true;
}

export { SETTINGS_TAB };
