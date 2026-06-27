import { WATCH_TABLE, type WatchTable } from "@/lib/constants/watches";
import { createServiceRoleClient } from "@/lib/supabase/admin";

/**
 * Load all watchers for an entity. Uses service role because RLS only lets
 * each user read their own watch rows — the actor adding an item cannot see
 * other members' watches via the user-scoped Supabase client.
 */
export async function loadWatcherRecipientIds(
  watchTable: WatchTable,
  entityId: string
): Promise<string[]> {
  const supabase = createServiceRoleClient();

  const { data, error } =
    watchTable === WATCH_TABLE.BUDGET
      ? await supabase
          .from("budget_watches")
          .select("user_id")
          .eq("budget_id", entityId)
      : await supabase
          .from("shopping_list_watches")
          .select("user_id")
          .eq("list_id", entityId);

  if (error) {
    console.error("[notifications] load watchers failed", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.user_id as string);
}
