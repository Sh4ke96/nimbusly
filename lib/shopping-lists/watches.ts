export interface ShoppingListWatch {
  id: string;
  user_id: string;
  list_id: string;
  created_at: string;
}

export function isShoppingListWatched(
  watchedListIds: ReadonlySet<string> | readonly string[],
  listId: string
): boolean {
  if (watchedListIds instanceof Set) {
    return watchedListIds.has(listId);
  }
  return (watchedListIds as readonly string[]).includes(listId);
}

export function watchedListIdsFromRows(
  rows: Pick<ShoppingListWatch, "list_id">[]
): string[] {
  return rows.map((row) => row.list_id);
}

export { excludeActorFromWatcherIds } from "@/lib/notifications/watches";
