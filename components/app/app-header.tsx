"use client";

import { GlobalSearchDialog } from "@/components/app/global-search-dialog";
import { Logo } from "@/components/logo";
import { AccountMenu } from "@/components/account/account-menu";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 py-3">
      <div className="flex items-center min-w-0 shrink-0">
        <Logo size="sm" href="/dashboard" />
      </div>
      <div className="flex items-center gap-2">
        <GlobalSearchDialog />
        <LanguageToggle className="hidden sm:flex" />
        <ThemeToggle />
        <NotificationsBell />
        <AccountMenu />
      </div>
    </header>
  );
}
