export const QUICK_ADD_ACTION = {
  CHORE: "chore",
  NOTE: "note",
  SHOPPING_ITEM: "shopping_item",
} as const;

export type QuickAddActionId =
  (typeof QUICK_ADD_ACTION)[keyof typeof QUICK_ADD_ACTION];
