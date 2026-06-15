import type { NimbusTourId } from "@/lib/constants/nimbus-tour";

const KEY = "nimbusly:nimbus-tour-resume";

export interface NimbusTourResumeState {
  tourId: NimbusTourId;
  stepIndex: number;
}

export function saveTourResume(state: NimbusTourResumeState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadTourResume(): NimbusTourResumeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NimbusTourResumeState;
    if (!parsed?.tourId || typeof parsed.stepIndex !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearTourResume() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
