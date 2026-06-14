"use client";

import { Logo } from "@/components/logo";
import { AccountMenu } from "@/components/account/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 py-3">
      <Logo size="sm" />
      <div className="flex items-center gap-2">
        <LanguageToggle className="hidden sm:flex" />
        <ThemeToggle />
        <AccountMenu />
      </div>
    </header>
  );
}
