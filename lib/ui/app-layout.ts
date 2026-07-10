import { cn } from "@/lib/utils";

/** Sticky app header — safe-area top, fixed toolbar row for vertical alignment. */
export const APP_HEADER_CLASS = cn(
  "sticky top-0 z-40",
  "border-b border-border bg-background/95 backdrop-blur-md",
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

/** View wrapper — at least full viewport height on mobile (iOS fixed nav); desktop uses min-h-screen. */
export const APP_VIEW_SHELL_CLASS = "flex flex-col min-h-dvh md:min-h-screen";

/** Height of the mobile bottom nav row (matches `h-14` / `--app-mobile-nav-height`). */
export const MOBILE_BOTTOM_NAV_ROW_HEIGHT = "3.5rem";

/** Stacking: Nimbus hints < bottom nav < menu sheet < PWA prompts */
export const APP_MOBILE_NIMBUS_HINT_Z = "z-40";
export const APP_MOBILE_BOTTOM_NAV_Z = "z-50";

/** Mobile bottom nav — layout in `.app-mobile-bottom-nav` (globals.css); decorative shell only. */
export const APP_MOBILE_BOTTOM_NAV_CLASS = cn(
  "app-mobile-bottom-nav md:hidden",
  "isolate border-t border-border bg-card",
  "shadow-[0_-1px_0_0_var(--border),0_-12px_32px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_-1px_0_0_var(--border),0_-12px_32px_-8px_rgba(0,0,0,0.35)]"
);
export const APP_NIMBUS_COMPANION_Z = "z-55";
export const APP_NIMBUS_POPOVER_Z = "z-60";

/** Sticky footer above mobile bottom nav — no safe-area padding; use `app-mobile-bottom-bar` for PWA paint. */
export const APP_MOBILE_BOTTOM_BAR_CLASS = "app-mobile-bottom-bar";

/** Full-screen sheet that leaves the fixed bottom nav uncovered. */
export const APP_MOBILE_SHEET_CLEAR_NAV_CLASS = "app-mobile-sheet-clear-nav";

/** Padding below the iOS notch / status bar (portaled overlays). */
export const APP_MOBILE_SAFE_TOP_CLASS = "app-mobile-safe-top";

/** Side sheet on mobile — safe-area top padding when sheet uses inset-y-0. */
export const APP_MOBILE_SHEET_SIDE_CLASS = "app-mobile-sheet-side";

/** Shopping add-item fullscreen dialog — tighter top, slight lift above bottom nav. */
export const APP_SHOPPING_ADD_DIALOG_MOBILE_INSET_CLASS = cn(
  "max-sm:top-[max(0px,calc(env(safe-area-inset-top,0px)-6px))]",
  "max-sm:bottom-[calc(var(--app-mobile-nav-offset)+0.25rem)]"
);

/** Shopping list sheet header — safe-area inset once (sheet body starts at top: 0). */
export const APP_MOBILE_SHOPPING_SHEET_HEADER_CLASS = "app-mobile-shopping-sheet-header";

/** Shopping list add footer — lifts controls above rounded screen corners. */
export const APP_MOBILE_SHOPPING_FOOTER_CLASS = "app-mobile-shopping-footer";

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
