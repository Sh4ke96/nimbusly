/** Light `:root --background` - PWA manifest letterbox / iOS splash default. */
export const PWA_BACKGROUND_COLOR_LIGHT = "#faf9f6" as const;

/** Dark `.dark --background` - startup paint when dark theme is active. */
export const PWA_BACKGROUND_COLOR_DARK = "#1a2326" as const;

/** PWA manifest letterbox - matches light `:root --background`. */
export const PWA_BACKGROUND_COLOR = PWA_BACKGROUND_COLOR_LIGHT;

export const PWA_SW_PATH = "/sw.js" as const;

export const PWA_CACHE_NAME = "nimbusly-shell-v3" as const;

export const PWA_ICON_APPLE_TOUCH = "/apple-touch-icon.png" as const;
export const PWA_ICON_192 = "/pwa-icon-192.png" as const;
export const PWA_ICON_512 = "/pwa-icon-512.png" as const;
export const PWA_ICON_SVG = "/pwa-icon.svg" as const;

export const PWA_STARTUP_SPLASH_STATIC_ID = "pwa-startup-splash-static" as const;

export const PWA_THEME_STORAGE_KEY = "nimbusly-theme" as const;

export const PWA_PRECACHE_URLS = [
  "/offline",
  PWA_ICON_APPLE_TOUCH,
  PWA_ICON_192,
  PWA_ICON_512,
  PWA_ICON_SVG,
  "/icon.svg",
] as const;
