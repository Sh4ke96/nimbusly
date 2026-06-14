export type SettingsTab = "profile" | "account" | "family";

export function settingsTabHref(tab: SettingsTab) {
  return `/profile/settings?tab=${tab}`;
}

export function navigateSettingsTab(tab: SettingsTab, pathname: string) {
  if (pathname !== "/profile/settings") return false;

  window.history.replaceState(window.history.state, "", settingsTabHref(tab));
  window.dispatchEvent(new CustomEvent("nimbusly:settings-tab", { detail: tab }));
  return true;
}
