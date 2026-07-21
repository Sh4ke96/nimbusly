"use client";

import { GlobalSearchDialog } from "@/components/app/global-search-dialog";
import { QuickAddHeaderButton } from "@/components/app/quick-add-header-button";
import { Logo } from "@/components/logo";
import { AccountMenu } from "@/components/account/account-menu";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { APP_HEADER_CLASS, APP_HEADER_ROW_CLASS } from "@/lib/ui/app-layout";

export function AppHeader() {
  return (
    <header className={APP_HEADER_CLASS}>
      <div className={APP_HEADER_ROW_CLASS}>
        <div className="flex h-10 sm:h-8 items-center min-w-0 shrink-0">
          <Logo size="sm" href="/dashboard" />
        </div>
        <div className="flex h-10 sm:h-8 items-center gap-1 sm:gap-2">
          <GlobalSearchDialog />
          <QuickAddHeaderButton />
          <LanguageToggle className="hidden sm:flex" />
          <ThemeToggle />
          <div className="hidden md:block">
            <NotificationsBell />
          </div>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
