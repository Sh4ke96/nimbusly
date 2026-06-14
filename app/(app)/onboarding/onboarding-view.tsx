"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/lang-context";
import { logout } from "@/app/(app)/actions";
import { LogOut } from "lucide-react";
import { OnboardingWizard } from "./onboarding-wizard";

export function OnboardingView() {
  const t = useT();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" className="gap-1.5">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t.onboarding.logout}</span>
            </Button>
          </form>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center space-y-2">
            <h1 className="font-heading font-bold text-3xl tracking-tight">
              {t.onboarding.title}
            </h1>
            <p className="text-muted-foreground text-sm">{t.onboarding.subtitle}</p>
          </div>

          <Card className="rounded-none shadow-sm">
            <CardContent className="pt-8">
              <OnboardingWizard />
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              Nimbusly.pl
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
