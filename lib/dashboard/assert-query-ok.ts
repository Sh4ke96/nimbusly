import type { PostgrestError } from "@supabase/supabase-js";

type QueryResult = { error: PostgrestError | null };

export function assertDashboardQueryOk(label: string, result: QueryResult): void {
  if (result.error) {
    console.error(`[dashboard] ${label}:`, result.error.message);
    throw new Error(`Dashboard load failed: ${label}`);
  }
}
