import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { ShoppingList } from "@/lib/shopping-lists/types";

const REALTIME_PAYLOAD_BASE = {
  schema: "public",
  commit_timestamp: "2026-01-01T00:00:00.000Z",
  errors: [] as string[],
} as const;

export function testRealtimeDeletePayload(
  table: string,
  old: Partial<ShoppingList> & Pick<ShoppingList, "id">
): RealtimePostgresChangesPayload<ShoppingList> {
  return {
    ...REALTIME_PAYLOAD_BASE,
    table,
    eventType: "DELETE",
    old,
  } as RealtimePostgresChangesPayload<ShoppingList>;
}

export function testRealtimeUpdatePayload(
  table: string,
  row: ShoppingList,
  old: Partial<ShoppingList> = row
): RealtimePostgresChangesPayload<ShoppingList> {
  return {
    ...REALTIME_PAYLOAD_BASE,
    table,
    eventType: "UPDATE",
    new: row,
    old,
  } as RealtimePostgresChangesPayload<ShoppingList>;
}
