export const SHOPPING_LIST_NAME_MAX_LENGTH = 200;
export const SHOPPING_LIST_ITEM_MAX_LENGTH = 500;

/** Debounce window before syncing rapid quantity taps to the server. */
export const SHOPPING_ITEM_QUANTITY_SYNC_DEBOUNCE_MS = 200;

/** sessionStorage key prefix - collapsed shopping category sections per list. */
export const SHOPPING_COLLAPSED_CATEGORIES_STORAGE_PREFIX =
  "nimbusly:shopping-collapsed:" as const;
