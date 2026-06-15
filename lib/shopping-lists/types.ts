import {
  SHOPPING_LIST_ITEM_MAX_LENGTH,
  SHOPPING_LIST_NAME_MAX_LENGTH,
} from "@/lib/constants/shopping-lists";
import {
  SHOPPING_ITEM_QUANTITY_MAX,
  SHOPPING_ITEM_QUANTITY_MIN,
} from "@/lib/constants/shopping-categories";

import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import {
  getFormBooleanTrue,
  getFormString,
  getFormTrimmedString,
} from "@/lib/form/values";

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
  quantity: number;
  category_id: string | null;
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

export function isValidShoppingItemQuantity(quantity: number): boolean {
  return (
    Number.isInteger(quantity) &&
    quantity >= SHOPPING_ITEM_QUANTITY_MIN &&
    quantity <= SHOPPING_ITEM_QUANTITY_MAX
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

export const SHOPPING_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  LIST_ID: "listId",
  NAME: "name",
  CONTENT: "content",
  CATEGORY_ID: "categoryId",
  QUANTITY: "quantity",
  ORDERED_IDS: "orderedIds",
  WATCH: "watch",
  CHECKED: "checked",
} as const;

export function parseShoppingListNameFromForm(formData: FormData): { name: string } {
  return {
    name: getFormString(formData, SHOPPING_FORM_FIELD.NAME),
  };
}

export function parseShoppingListIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, SHOPPING_FORM_FIELD.ID);
}

export function parseShoppingListWatchFromForm(formData: FormData): {
  listId: string;
  watch: boolean;
} {
  return {
    listId: getFormTrimmedString(formData, SHOPPING_FORM_FIELD.LIST_ID),
    watch: getFormBooleanTrue(formData, SHOPPING_FORM_FIELD.WATCH),
  };
}

export function parseShoppingItemFromForm(formData: FormData): {
  listId: string;
  content: string;
  categoryId: string | null;
  quantity: number;
} {
  const categoryRaw = formData.get(SHOPPING_FORM_FIELD.CATEGORY_ID);
  const quantityRaw = formData.get(SHOPPING_FORM_FIELD.QUANTITY);
  let quantity = SHOPPING_ITEM_QUANTITY_MIN;
  if (typeof quantityRaw === "string" && quantityRaw.length > 0) {
    const parsed = Number.parseInt(quantityRaw, 10);
    if (Number.isFinite(parsed)) quantity = parsed;
  }

  return {
    listId: getFormTrimmedString(formData, SHOPPING_FORM_FIELD.LIST_ID),
    content: getFormString(formData, SHOPPING_FORM_FIELD.CONTENT),
    categoryId:
      typeof categoryRaw === "string" && categoryRaw.length > 0 ? categoryRaw : null,
    quantity,
  };
}

export function parseShoppingItemUpdateFromForm(formData: FormData): {
  id: string;
  listId: string;
  content: string | null;
  checked: boolean | null;
  quantity: number | null;
} {
  const contentRaw = formData.get(SHOPPING_FORM_FIELD.CONTENT);
  const checkedRaw = formData.get(SHOPPING_FORM_FIELD.CHECKED);
  const quantityRaw = formData.get(SHOPPING_FORM_FIELD.QUANTITY);

  let quantity: number | null = null;
  if (typeof quantityRaw === "string" && quantityRaw.length > 0) {
    const parsed = Number.parseInt(quantityRaw, 10);
    quantity = Number.isFinite(parsed) ? parsed : null;
  }

  return {
    id: getFormTrimmedString(formData, SHOPPING_FORM_FIELD.ID),
    listId: getFormTrimmedString(formData, SHOPPING_FORM_FIELD.LIST_ID),
    content: typeof contentRaw === "string" ? contentRaw : null,
    checked:
      checkedRaw === "true" ? true : checkedRaw === "false" ? false : null,
    quantity,
  };
}

export function parseShoppingItemIdsFromForm(formData: FormData): {
  id: string;
  listId: string;
} {
  return {
    id: getFormTrimmedString(formData, SHOPPING_FORM_FIELD.ID),
    listId: getFormTrimmedString(formData, SHOPPING_FORM_FIELD.LIST_ID),
  };
}

export function parseShoppingReorderFromForm(formData: FormData): {
  listId: string;
  orderedIdsRaw: string;
} {
  return {
    listId: getFormTrimmedString(formData, SHOPPING_FORM_FIELD.LIST_ID),
    orderedIdsRaw: getFormString(formData, SHOPPING_FORM_FIELD.ORDERED_IDS),
  };
}

export function parseShoppingCheckedFromForm(formData: FormData): {
  id: string;
  listId: string;
  checked: boolean;
} {
  return {
    id: getFormTrimmedString(formData, SHOPPING_FORM_FIELD.ID),
    listId: getFormTrimmedString(formData, SHOPPING_FORM_FIELD.LIST_ID),
    checked: getFormBooleanTrue(formData, SHOPPING_FORM_FIELD.CHECKED),
  };
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
