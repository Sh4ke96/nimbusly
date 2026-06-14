"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { AuthDecorativePanel } from "@/components/auth/auth-decorative-panel";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { FloatingModulePills } from "@/components/ui/floating-module-pills";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/lang-context";

export function AuthLayoutClient({ children }: { children: React.ReactNode }) {
  const t = useT();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <AmbientBackground variant="auth" />

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
          <AuthDecorativePanel className="hidden lg:flex" />

          <div className="w-full max-w-sm shrink-0 space-y-6">
            <div
              className="relative mx-auto h-36 w-full overflow-hidden rounded-none border border-primary/25 bg-linear-to-r from-primary/10 via-card/30 to-accent/10 lg:hidden"
              aria-hidden
            >
              <FloatingModulePills showLabels={false} pillClassName="scale-90 opacity-90" />
            </div>

            <div className="animate-rise">
              <Card className="rounded-none border-border/80 bg-card/95 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-6 pt-8 pb-8">{children}</CardContent>
              </Card>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                {t.login.backHome}{" "}
                <Link href="/" className="text-primary hover:underline">
                  Nimbusly.pl
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
