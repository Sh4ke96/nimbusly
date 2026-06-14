export { excludeActorFromWatcherIds } from "@/lib/notifications/watches";

export function watchedBudgetIdsFromRows(
  rows: { budget_id: string }[]
): string[] {
  return rows.map((row) => row.budget_id);
}
