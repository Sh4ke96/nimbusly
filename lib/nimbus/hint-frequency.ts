import type { NimbusContextHintKey } from "@/lib/nimbus/context-hints";

const SESSION_KEY = "nimbusly:context-hint-session";
const DISMISS_PREFIX = "nimbusly:context-hint-dismiss:";

function readSessionModules(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((value): value is string => typeof value === "string"));
  } catch {
    return new Set();
  }
}

function writeSessionModules(modules: Set<string>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify([...modules]));
}

export function shouldShowContextHint(moduleKey: NimbusContextHintKey): boolean {
  if (typeof window === "undefined") return false;
  if (window.localStorage.getItem(`${DISMISS_PREFIX}${moduleKey}`) === "1") return false;
  return !readSessionModules().has(moduleKey);
}

export function markContextHintShown(moduleKey: NimbusContextHintKey) {
  const modules = readSessionModules();
  modules.add(moduleKey);
  writeSessionModules(modules);
}

export function dismissContextHint(moduleKey: NimbusContextHintKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${DISMISS_PREFIX}${moduleKey}`, "1");
  const modules = readSessionModules();
  modules.add(moduleKey);
  writeSessionModules(modules);
}
