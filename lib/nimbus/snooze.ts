export const NIMBUS_SNOOZE_KEY = "nimbusly:nimbus-snooze-until";

export const NIMBUS_SNOOZE_24H_MS = 24 * 60 * 60 * 1000;
export const NIMBUS_SNOOZE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function snoozeNimbusHints(durationMs: number) {
  if (typeof window === "undefined") return;
  const until = Date.now() + durationMs;
  window.localStorage.setItem(NIMBUS_SNOOZE_KEY, String(until));
}

export function isNimbusHintsSnoozed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(NIMBUS_SNOOZE_KEY);
  if (!raw) return false;
  const until = Number(raw);
  if (!Number.isFinite(until) || until <= Date.now()) {
    window.localStorage.removeItem(NIMBUS_SNOOZE_KEY);
    return false;
  }
  return true;
}

export function clearNimbusHintsSnooze() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(NIMBUS_SNOOZE_KEY);
}
