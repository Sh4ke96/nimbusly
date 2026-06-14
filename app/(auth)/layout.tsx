"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Card, CardContent } from "@/components/ui/card";
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
          <Card className="rounded-none shadow-sm">
            <CardContent className="pt-8 space-y-6">{children}</CardContent>
          </Card>
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
