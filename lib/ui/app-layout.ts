import { cn } from "@/lib/utils";

/** Sticky app header — safe-area top, fixed toolbar row for vertical alignment. */
export const APP_HEADER_CLASS = cn(
  "sticky top-0 z-40",
  "border-b border-border bg-background/80 backdrop-blur-md",
  "pt-[env(safe-area-inset-top,0px)]"
);

/** Inner header row — matches mobile bottom nav height (`h-14`). */
export const APP_HEADER_ROW_CLASS = cn(
  "flex h-14 sm:h-16 items-center justify-between gap-2",
  "px-4 sm:px-6"
);

const APP_PAGE_BASE = cn(
  "mx-auto w-full space-y-5 sm:space-y-6",
  "px-4 py-5 sm:px-6 sm:py-10"
);

/** View wrapper — full viewport height on desktop only; mobile uses natural flow + bottom inset. */
export const APP_VIEW_SHELL_CLASS = "flex flex-col md:min-h-screen";

/** Height of the mobile bottom nav row (matches `h-14` / `--app-mobile-nav-height`). */
export const MOBILE_BOTTOM_NAV_ROW_HEIGHT = "3.5rem";

/** Stacking: Nimbus hints < bottom nav < menu sheet < PWA prompts */
export const APP_MOBILE_NIMBUS_HINT_Z = "z-40";
export const APP_MOBILE_BOTTOM_NAV_Z = "z-50";

/** Mobile bottom nav — always viewport-fixed; do not add `relative` here. */
export const APP_MOBILE_BOTTOM_NAV_CLASS = cn(
  "fixed inset-x-0 bottom-0 left-0 right-0 md:hidden app-mobile-bottom-nav",
  APP_MOBILE_BOTTOM_NAV_Z,
  "isolate border-t border-border bg-background",
  "shadow-[0_-1px_0_0_var(--border),0_-8px_24px_-4px_rgba(0,0,0,0.08)]"
);
export const APP_NIMBUS_COMPANION_Z = "z-55";
export const APP_NIMBUS_POPOVER_Z = "z-60";

/** Sticky footer above mobile bottom nav — no safe-area padding; use `app-mobile-bottom-bar` for PWA paint. */
export const APP_MOBILE_BOTTOM_BAR_CLASS = "app-mobile-bottom-bar";

/** Reserve space for the fixed bottom nav row (height only — safe-area is painted via ::after). */
export const APP_MOBILE_NAV_INSET_CLASS = "pb-[var(--app-mobile-nav-offset)]";

export const APP_PAGE_WIDTH = {
  compact: "max-w-3xl",
  narrow: "max-w-4xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
  full: "max-w-7xl",
} as const;

export type AppPageWidth = keyof typeof APP_PAGE_WIDTH;

export function appPageClass(
  width: AppPageWidth = "default",
  options?: { className?: string }
): string {
  return cn(APP_PAGE_BASE, APP_PAGE_WIDTH[width], options?.className);
}

/** Minimum touch target for primary controls on mobile. */
export const TOUCH_TARGET_CLASS = "min-h-10 min-w-10 sm:min-h-0 sm:min-w-0";
