import { SHOPPING_COLLAPSED_CATEGORIES_STORAGE_PREFIX } from "@/lib/constants/shopping-lists";

function storageKey(listId: string): string {
  return `${SHOPPING_COLLAPSED_CATEGORIES_STORAGE_PREFIX}${listId}`;
}

export function readCollapsedCategoryKeys(listId: string): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = sessionStorage.getItem(storageKey(listId));
    if (!raw) return new Set();

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();

    return new Set(parsed.filter((key): key is string => typeof key === "string" && key.length > 0));
  } catch {
    return new Set();
  }
}

export function writeCollapsedCategoryKeys(listId: string, keys: ReadonlySet<string>): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(storageKey(listId), JSON.stringify([...keys]));
  } catch {
    // Private mode / quota — ignore; UI still works for this session.
  }
}
