import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Quicksand, Nunito, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import { LangProvider } from "@/lib/lang-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { VersionBadge } from "@/components/app/version-badge";
import { AuthSessionSync } from "@/components/auth/auth-session-sync";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { LANG, LANG_COOKIE, type Lang } from "@/lib/constants/lang";
import { PWA_ICON_APPLE_TOUCH } from "@/lib/constants/pwa";
import { dict } from "@/lib/i18n";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANG_COOKIE)?.value;
  const lang: Lang = value === LANG.EN ? LANG.EN : LANG.PL;

  return {
    title: dict[lang].meta.title,
    description: dict[lang].meta.description,
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
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#618764" },
    { media: "(prefers-color-scheme: dark)", color: "#2B5748" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANG_COOKIE)?.value;
  const lang: Lang = value === LANG.EN ? LANG.EN : LANG.PL;

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${quicksand.variable} ${nunito.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <LangProvider initialLang={lang}>
            <TooltipProvider>
              <AuthSessionSync />
              <PwaRegister />
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
