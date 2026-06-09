"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useT } from "@/lib/lang-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useT();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-6">
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t.login.backHome}{" "}
            <Link href="/" className="text-primary hover:underline">
              Nimbusly.pl
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
