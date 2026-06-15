import { APP_VERSION } from "@/lib/changelog/entries";

const KEY = "nimbusly:last-seen-version";

export function shouldShowChangelogHint(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) !== APP_VERSION;
}

export function markChangelogSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, APP_VERSION);
}
