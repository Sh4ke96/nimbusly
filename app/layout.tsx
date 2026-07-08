import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Quicksand, Nunito, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LangProvider } from "@/lib/lang-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { VersionBadge } from "@/components/app/version-badge";
import { AuthSessionSync } from "@/components/auth/auth-session-sync";
import { PageVisibilitySync } from "@/components/app/page-visibility-sync";
import { PwaRegisterLazy } from "@/components/pwa/pwa-register-lazy";
import { PwaStartupSplash } from "@/components/pwa/pwa-startup-splash";
import { LANG } from "@/lib/constants/lang";
import {
  PWA_BACKGROUND_COLOR_DARK,
  PWA_BACKGROUND_COLOR_LIGHT,
  PWA_ICON_192,
  PWA_ICON_APPLE_TOUCH,
  PWA_STARTUP_SPLASH_STATIC_ID,
  PWA_THEME_STORAGE_KEY,
} from "@/lib/constants/pwa";
import { dict } from "@/lib/i18n";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: dict[LANG.PL].meta.title,
  description: dict[LANG.PL].meta.description,
  applicationName: "Nimbusly",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nimbusly",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/pwa-icon-192.png",
    apple: [
      { url: PWA_ICON_APPLE_TOUCH, sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#618764" },
    { media: "(prefers-color-scheme: dark)", color: "#2B5748" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={LANG.PL}
      data-scroll-behavior="smooth"
      className={`${quicksand.variable} ${nunito.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k=${JSON.stringify(PWA_THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var r=document.documentElement;if(t==="light")r.classList.remove("dark");else r.classList.add("dark");if(window.navigator.standalone===true)r.classList.add("ios-standalone")}catch(e){document.documentElement.classList.add("dark")}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html{background-color:${PWA_BACKGROUND_COLOR_DARK}}html:not(.dark),html:not(.dark) body{background-color:${PWA_BACKGROUND_COLOR_LIGHT}}html.dark,html.dark body{background-color:${PWA_BACKGROUND_COLOR_DARK}}body{min-height:100%;background-color:inherit}#${PWA_STARTUP_SPLASH_STATIC_ID}{display:none;position:fixed;inset:0;z-index:10001;align-items:center;justify-content:center;background:${PWA_BACKGROUND_COLOR_DARK}}#${PWA_STARTUP_SPLASH_STATIC_ID} img{width:4.5rem;height:4.5rem;animation:pwa-splash-pulse 1.2s ease-in-out infinite}@keyframes pwa-splash-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.72;transform:scale(.94)}}@media (display-mode:standalone),(display-mode:fullscreen),(display-mode:minimal-ui){#${PWA_STARTUP_SPLASH_STATIC_ID}{display:flex}}html.ios-standalone #${PWA_STARTUP_SPLASH_STATIC_ID}{display:flex}html[data-app-ready] #${PWA_STARTUP_SPLASH_STATIC_ID}{display:none!important}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        <div id={PWA_STARTUP_SPLASH_STATIC_ID} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- instant PWA splash before JS */}
          <img src={PWA_ICON_192} alt="" width={72} height={72} />
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey={PWA_THEME_STORAGE_KEY}
          disableTransitionOnChange
        >
          <LangProvider initialLang={LANG.PL}>
            <TooltipProvider>
              <AuthSessionSync />
              <PageVisibilitySync />
              <PwaRegisterLazy />
              <PwaStartupSplash />
              {children}
              <VersionBadge />
              <Toaster
                closeButton
                position="top-center"
                className="!top-[max(0.75rem,env(safe-area-inset-top))] sm:!top-4"
                toastOptions={{
                  classNames: {
                    toast: "rounded-none",
                  },
                }}
              />
              <Analytics />
              <SpeedInsights />
            </TooltipProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
