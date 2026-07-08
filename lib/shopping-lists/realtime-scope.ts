import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { ShoppingList } from "@/lib/shopping-lists/types";

export type ShoppingListsRealtimeScope = {
  userId: string;
  familyId: string | null;
};

export function shoppingListMatchesRealtimeScope(
  list: Pick<ShoppingList, "family_id" | "created_by">,
  scope: ShoppingListsRealtimeScope
): boolean {
  if (scope.familyId) {
    return list.family_id === scope.familyId;
  }
  return list.created_by === scope.userId;
}

/**
 * Supabase DELETE payloads often include only the primary key unless REPLICA IDENTITY FULL.
 * Do not rely on server-side realtime filters for list deletes — match by known list ids.
 */
export function shouldApplyShoppingListRealtimeEvent(
  payload: RealtimePostgresChangesPayload<ShoppingList>,
  scope: ShoppingListsRealtimeScope,
  knownListIds: ReadonlySet<string>
): boolean {
  if (payload.eventType === "DELETE") {
    const id = payload.old?.id;
    return !!id && knownListIds.has(id);
  }

  const row = payload.new;
  if (!row) return false;
  return shoppingListMatchesRealtimeScope(row, scope);
}
