export const NAV_TRANSITION = {
  /** Minimum time the overlay stays visible to avoid flicker */
  MIN_VISIBLE_MS: 280,
  /** Fade-out duration - keep in sync with Tailwind `duration-300` */
  FADE_MS: 300,
  /** Safety cap so the overlay never sticks after a cancelled navigation */
  MAX_VISIBLE_MS: 8_000,
} as const;
