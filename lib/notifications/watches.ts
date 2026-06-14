export function excludeActorFromWatcherIds(
  watcherIds: string[],
  actorId: string
): string[] {
  return watcherIds.filter((id) => id !== actorId);
}
