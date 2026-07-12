/** Group push notifications from the same actor in the same module within this window. */
export const PUSH_BATCH_WINDOW_MS = 2 * 60 * 1000;

export const PUSH_BATCH_TAG_PREFIX = "nimbusly-batch" as const;
