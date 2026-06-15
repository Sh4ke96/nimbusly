const KEY = "nimbusly:nimbus-module-visits";

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((p): p is string => typeof p === "string"));
  } catch {
    return new Set();
  }
}

function writeSet(paths: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify([...paths]));
}

export function isFirstModuleVisit(pathname: string): boolean {
  return !readSet().has(pathname);
}

export function markModuleVisited(pathname: string) {
  const paths = readSet();
  paths.add(pathname);
  writeSet(paths);
}
