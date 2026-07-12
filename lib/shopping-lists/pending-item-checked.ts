const pendingCheckedByItemId = new Map<string, boolean>();

export function setPendingItemChecked(itemId: string, checked: boolean): void {
  pendingCheckedByItemId.set(itemId, checked);
}

export function clearPendingItemChecked(itemId: string): void {
  pendingCheckedByItemId.delete(itemId);
}

export function getPendingItemChecked(itemId: string): boolean | undefined {
  return pendingCheckedByItemId.get(itemId);
}

export function resetPendingItemChecked(): void {
  pendingCheckedByItemId.clear();
}
