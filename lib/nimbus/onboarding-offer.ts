const KEY = "nimbusly:nimbus-intro-offered";

export function shouldOfferIntroTour(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) !== "1";
}

export function markIntroTourOffered() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
}
