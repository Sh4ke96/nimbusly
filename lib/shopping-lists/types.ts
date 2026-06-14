import {
  SHOPPING_LIST_ITEM_MAX_LENGTH,
  SHOPPING_LIST_NAME_MAX_LENGTH,
} from "@/lib/constants/shopping-lists";

export interface ShoppingList {
  id: string;
  family_id: string | null;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  content: string;
  checked: boolean;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function normalizeShoppingListName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeShoppingItemContent(content: string): string {
  return content.trim().replace(/\s+/g, " ");
}

export function isValidShoppingListName(name: string): boolean {
  const normalized = normalizeShoppingListName(name);
  return (
    normalized.length > 0 && normalized.length <= SHOPPING_LIST_NAME_MAX_LENGTH
  );
}

export function isValidShoppingItemContent(content: string): boolean {
  const normalized = normalizeShoppingItemContent(content);
  return (
    normalized.length > 0 && normalized.length <= SHOPPING_LIST_ITEM_MAX_LENGTH
  );
}

export function sortShoppingListItems(
  items: ShoppingListItem[]
): ShoppingListItem[] {
  return [...items].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.created_at.localeCompare(b.created_at);
  });
}

export function applyItemOrder(
  items: ShoppingListItem[],
  orderedIds: string[]
): ShoppingListItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered: ShoppingListItem[] = [];

  orderedIds.forEach((id, index) => {
    const item = byId.get(id);
    if (!item) return;
    ordered.push({ ...item, sort_order: index });
    byId.delete(id);
  });

  const remaining = sortShoppingListItems([...byId.values()]);
  remaining.forEach((item, offset) => {
    ordered.push({ ...item, sort_order: orderedIds.length + offset });
  });

  return ordered;
}

export function parseOrderedItemIds(raw: string): string[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every((id) => typeof id === "string" && id.length > 0)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
