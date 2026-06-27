import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nimbusly",
    short_name: "Nimbusly",
    description:
      "Family hub — budget, shopping, schedule, chores, notes, and more in one place.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait-primary",
    background_color: "#1f2a2e",
    theme_color: "#2B5748",
    lang: "pl",
    dir: "ltr",
    categories: ["lifestyle", "productivity", "utilities"],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Panel",
        url: "/dashboard",
        icons: [{ src: "/pwa-icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "Shopping",
        short_name: "Zakupy",
        url: "/shopping",
        icons: [{ src: "/pwa-icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "Notifications",
        short_name: "Alerty",
        url: "/notifications",
        icons: [{ src: "/pwa-icon.svg", sizes: "any", type: "image/svg+xml" }],
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
