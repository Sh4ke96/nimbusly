import type { Metadata } from "next";
import { Quicksand, Nunito, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import { LangProvider } from "@/lib/lang-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { LANG, LANG_COOKIE, type Lang } from "@/lib/constants/lang";
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
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
      apple: "/icon.svg",
    },
  };
}

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
              {children}
              <Toaster closeButton position="top-right" />
            </TooltipProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
