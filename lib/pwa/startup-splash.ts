import { PWA_STARTUP_SPLASH_STATIC_ID } from "@/lib/constants/pwa";

export function removeStaticPwaSplash(): void {
  if (typeof document === "undefined") return;

  document.getElementById(PWA_STARTUP_SPLASH_STATIC_ID)?.remove();
  document.documentElement.setAttribute("data-app-ready", "");
}
