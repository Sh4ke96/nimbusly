import {
  SHOPPING_CATEGORY_NAME_MAX_LENGTH,
  SHOPPING_UNCATEGORIZED_KEY,
} from "@/lib/constants/shopping-categories";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import {
  getFormString,
  getFormTrimmedString,
} from "@/lib/form/values";
import type { ShoppingListItem } from "@/lib/shopping-lists/types";
import { sortShoppingListItems } from "@/lib/shopping-lists/types";

export interface ShoppingListCategory {
  id: string;
  family_id: string | null;
  created_by: string | null;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function normalizeShoppingCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function isValidShoppingCategoryName(name: string): boolean {
  const normalized = normalizeShoppingCategoryName(name);
  return (
    normalized.length > 0 &&
    normalized.length <= SHOPPING_CATEGORY_NAME_MAX_LENGTH
  );
}

export function sortShoppingListCategories(
  categories: ShoppingListCategory[]
): ShoppingListCategory[] {
  return [...categories].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.name.localeCompare(b.name);
  });
}

export function applyCategoryOrder(
  categories: ShoppingListCategory[],
  orderedIds: string[]
): ShoppingListCategory[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const ordered: ShoppingListCategory[] = [];

  orderedIds.forEach((id, index) => {
    const category = byId.get(id);
    if (!category) return;
    ordered.push({ ...category, sort_order: index });
    byId.delete(id);
  });

  const remaining = sortShoppingListCategories([...byId.values()]);
  remaining.forEach((category, offset) => {
    ordered.push({ ...category, sort_order: orderedIds.length + offset });
  });

  return ordered;
}

export interface ShoppingCategoryGroup {
  key: string;
  categoryId: string | null;
  name: string;
  items: ShoppingListItem[];
}

export function groupShoppingItemsByCategory(
  items: ShoppingListItem[],
  categories: ShoppingListCategory[],
  uncategorizedLabel: string
): ShoppingCategoryGroup[] {
  const sortedCategories = sortShoppingListCategories(categories);
  const byCategory = new Map<string | null, ShoppingListItem[]>();

  for (const item of sortShoppingListItems(items)) {
    const key = item.category_id ?? null;
    const bucket = byCategory.get(key) ?? [];
    bucket.push(item);
    byCategory.set(key, bucket);
  }

  const groups: ShoppingCategoryGroup[] = sortedCategories
    .map((category) => ({
      key: category.id,
      categoryId: category.id,
      name: category.name,
      items: byCategory.get(category.id) ?? [],
    }))
    .filter((group) => group.items.length > 0);

  const uncategorized = byCategory.get(null) ?? [];
  if (uncategorized.length > 0) {
    groups.push({
      key: SHOPPING_UNCATEGORIZED_KEY,
      categoryId: null,
      name: uncategorizedLabel,
      items: uncategorized,
    });
  }

  return groups;
}

export function mergeCategoryItemOrder(
  groups: ShoppingCategoryGroup[],
  categoryKey: string,
  orderedIdsInCategory: string[]
): string[] {
  const result: string[] = [];

  for (const group of groups) {
    if (group.key === categoryKey) {
      const byId = new Map(group.items.map((item) => [item.id, item]));
      orderedIdsInCategory.forEach((id) => {
        if (byId.has(id)) result.push(id);
        byId.delete(id);
      });
      sortShoppingListItems([...byId.values()]).forEach((item) => result.push(item.id));
      continue;
    }

    sortShoppingListItems(group.items).forEach((item) => result.push(item.id));
  }

  return result;
}

export const SHOPPING_CATEGORY_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  NAME: "name",
  ORDERED_IDS: "orderedIds",
} as const;

export function parseShoppingCategoryNameFromForm(formData: FormData): {
  name: string;
} {
  return {
    name: getFormString(formData, SHOPPING_CATEGORY_FORM_FIELD.NAME),
  };
}

export function parseShoppingCategoryIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, SHOPPING_CATEGORY_FORM_FIELD.ID);
}

export function parseShoppingCategoryReorderFromForm(formData: FormData): {
  orderedIdsRaw: string;
} {
  return {
    orderedIdsRaw: getFormString(formData, SHOPPING_CATEGORY_FORM_FIELD.ORDERED_IDS),
  };
}

export function parseOrderedCategoryIds(raw: string): string[] | null {
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
