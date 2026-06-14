export type SettingsTab = "profile" | "account" | "family" | "password";

const SETTINGS_TABS: SettingsTab[] = ["profile", "account", "family", "password"];

export function parseSettingsTab(value: string | null): SettingsTab {
  if (value && SETTINGS_TABS.includes(value as SettingsTab)) {
    return value as SettingsTab;
  }
  return "profile";
}

export function settingsTabHref(tab: SettingsTab) {
  return `/profile/settings?tab=${tab}`;
}

export function navigateSettingsTab(tab: SettingsTab, pathname: string, hash = "") {
  if (pathname !== "/profile/settings") return false;

  window.history.replaceState(window.history.state, "", `${settingsTabHref(tab)}${hash}`);
  window.dispatchEvent(new CustomEvent("nimbusly:settings-tab", { detail: tab }));

  if (hash.startsWith("#")) {
    requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return true;
}
