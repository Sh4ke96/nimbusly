const KEY = "nimbusly:nimbus-search-used";

export function isSearchFirstUse(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) !== "1";
}

export function markSearchUsed() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
}
