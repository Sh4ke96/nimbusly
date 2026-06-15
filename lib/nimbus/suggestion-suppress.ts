import type { NimbusSuggestionId } from "@/lib/nimbus/suggestions";

const KEY = "nimbusly:suppressed-suggestions";

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeSet(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify([...ids]));
}

export function suppressSuggestion(id: NimbusSuggestionId) {
  const ids = readSet();
  ids.add(id);
  writeSet(ids);
}

export function isSuggestionSuppressed(id: NimbusSuggestionId): boolean {
  return readSet().has(id);
}

export function filterSuppressedSuggestions<T extends NimbusSuggestionId>(ids: T[]): T[] {
  const suppressed = readSet();
  return ids.filter((id) => !suppressed.has(id));
}
