const pendingChoreTaskIds = new Set<string>();

export function setPendingChoreTask(taskId: string): void {
  pendingChoreTaskIds.add(taskId);
}

export function clearPendingChoreTask(taskId: string): void {
  pendingChoreTaskIds.delete(taskId);
}

export function hasPendingChoreTasks(): boolean {
  return pendingChoreTaskIds.size > 0;
}

export function resetPendingChoreTasks(): void {
  pendingChoreTaskIds.clear();
}
