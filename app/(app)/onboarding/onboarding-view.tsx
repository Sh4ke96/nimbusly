"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { LogoutConfirmDialog } from "@/components/account/logout-confirm-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/lang-context";
import { LogOut } from "lucide-react";
import type { OnboardingInvitePrefill } from "@/lib/family/onboarding-invite-prefill";
import { OnboardingWizard } from "./onboarding-wizard";

type OnboardingViewProps = {
  invitePrefill: OnboardingInvitePrefill;
};

export function OnboardingView({ invitePrefill }: OnboardingViewProps) {
  const t = useT();
  const [logoutOpen, setLogoutOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col md:min-h-screen">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">{t.onboarding.logout}</span>
          </Button>
        </div>
      </header>

      <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} />

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
              <OnboardingWizard invitePrefill={invitePrefill} />
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
