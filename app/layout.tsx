import type { Metadata } from "next";
import { Quicksand, Nunito, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import { LangProvider } from "@/lib/lang-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Lang } from "@/lib/i18n";
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

export const metadata: Metadata = {
  title: "Nimbusly — Wspólna przestrzeń dla całej rodziny",
  description:
    "Zarządzaj budżetem, planuj zakupy, pamiętaj o urodzinach i dziel się pomysłami. Połącz się z bliskimi i widzcie te same dane — każdy wie, kto co dodał.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("nimbusly-lang")?.value ?? "pl") as Lang;

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
            <TooltipProvider>{children}</TooltipProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
