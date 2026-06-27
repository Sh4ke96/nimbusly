export const WATCH_ENTITY_KIND = {
  SHOPPING_LIST: "shopping_list",
  BUDGET: "budget",
} as const;

export type WatchEntityKind = (typeof WATCH_ENTITY_KIND)[keyof typeof WATCH_ENTITY_KIND];

export const WATCH_TABLE = {
  SHOPPING_LIST: "shopping_list_watches",
  BUDGET: "budget_watches",
} as const;

export type WatchTable = (typeof WATCH_TABLE)[keyof typeof WATCH_TABLE];

export function watchEntityKindFromTable(watchTable: WatchTable): WatchEntityKind {
  return watchTable === WATCH_TABLE.BUDGET
    ? WATCH_ENTITY_KIND.BUDGET
    : WATCH_ENTITY_KIND.SHOPPING_LIST;
}
