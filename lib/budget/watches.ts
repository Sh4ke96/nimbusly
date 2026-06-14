export function excludeActorFromWatcherIds(
  watcherIds: string[],
  actorId: string
): string[] {
  return watcherIds.filter((id) => id !== actorId);
}

export function watchedBudgetIdsFromRows(
  rows: { budget_id: string }[]
): string[] {
  return rows.map((row) => row.budget_id);
}
