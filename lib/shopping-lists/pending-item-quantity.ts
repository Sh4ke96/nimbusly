const pendingQuantityByItemId = new Map<string, number>();

export function setPendingItemQuantity(itemId: string, quantity: number): void {
  pendingQuantityByItemId.set(itemId, quantity);
}

export function clearPendingItemQuantity(itemId: string): void {
  pendingQuantityByItemId.delete(itemId);
}

export function getPendingItemQuantity(itemId: string): number | undefined {
  return pendingQuantityByItemId.get(itemId);
}

/** Test helper - resets module state between unit tests. */
export function resetPendingItemQuantities(): void {
  pendingQuantityByItemId.clear();
}
