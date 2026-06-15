const inflight = new Map<string, Promise<unknown>>();

export function clearDedupeAsync() {
  inflight.clear();
}

/** Runs async work once per key while a prior call is still in flight. */
export function dedupeAsync<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}
