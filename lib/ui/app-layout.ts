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
