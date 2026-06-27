import type { MetadataRoute } from "next";
import type { Lang } from "@/lib/constants/lang";
import type { Dict } from "@/lib/i18n/types";

const PWA_SHORTCUT_ICON = {
  src: "/pwa-icon.svg",
  sizes: "any",
  type: "image/svg+xml",
} as const;

export function buildPwaManifest(t: Dict, lang: Lang): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nimbusly",
    short_name: "Nimbusly",
    description: t.pwa.manifestDescription,
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait-primary",
    background_color: "#1f2a2e",
    theme_color: "#2B5748",
    lang,
    dir: "ltr",
    categories: ["lifestyle", "productivity", "utilities"],
    shortcuts: [
      {
        name: t.pwa.shortcutDashboard,
        short_name: t.pwa.shortcutDashboardShort,
        url: "/dashboard",
        icons: [PWA_SHORTCUT_ICON],
      },
      {
        name: t.pwa.shortcutShopping,
        short_name: t.pwa.shortcutShoppingShort,
        url: "/shopping",
        icons: [PWA_SHORTCUT_ICON],
      },
      {
        name: t.pwa.shortcutNotifications,
        short_name: t.pwa.shortcutNotificationsShort,
        url: "/notifications",
        icons: [PWA_SHORTCUT_ICON],
      },
    ],
    icons: [
      {
        src: "/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/pwa-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
