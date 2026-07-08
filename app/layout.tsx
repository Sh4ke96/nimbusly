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
import { PwaStartupSplashLazy } from "@/components/pwa/pwa-startup-splash-lazy";
import { LANG } from "@/lib/constants/lang";
import {
  PWA_BACKGROUND_COLOR_DARK,
  PWA_BACKGROUND_COLOR_LIGHT,
  PWA_ICON_APPLE_TOUCH,
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
        <style
          dangerouslySetInnerHTML={{
            __html: `html{background-color:${PWA_BACKGROUND_COLOR_DARK}}html:not(.dark),html:not(.dark) body{background-color:${PWA_BACKGROUND_COLOR_LIGHT}}html.dark,html.dark body{background-color:${PWA_BACKGROUND_COLOR_DARK}}body{min-height:100%;background-color:inherit}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="nimbusly-theme"
          disableTransitionOnChange
        >
          <LangProvider initialLang={LANG.PL}>
            <TooltipProvider>
              <AuthSessionSync />
              <PageVisibilitySync />
              <PwaRegisterLazy />
              <PwaStartupSplashLazy />
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
