export const PWA_SW_PATH = "/sw.js" as const;

export const PWA_CACHE_NAME = "nimbusly-shell-v1" as const;

export const PWA_ICON_APPLE_TOUCH = "/apple-touch-icon.png" as const;
export const PWA_ICON_192 = "/pwa-icon-192.png" as const;
export const PWA_ICON_512 = "/pwa-icon-512.png" as const;
export const PWA_ICON_SVG = "/pwa-icon.svg" as const;

export const PWA_PRECACHE_URLS = [
  "/offline",
  PWA_ICON_APPLE_TOUCH,
  PWA_ICON_192,
  PWA_ICON_512,
  PWA_ICON_SVG,
  "/icon.svg",
] as const;
