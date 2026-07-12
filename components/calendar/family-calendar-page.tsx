"use client";

import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { FamilyCalendarView } from "@/components/calendar/family-calendar-view";
import { useT } from "@/lib/lang-context";

export function FamilyCalendarPage() {
  const t = useT();

  return (
    <div className="flex flex-col md:min-h-screen">
      <div className="no-print">
        <AppHeader />
      </div>

      <AppPage width="full">
        <div className="no-print">
          <AccountBreadcrumbs current={t.familyCalendar.title} />
        </div>

        <header className="space-y-1 no-print">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {t.familyCalendar.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.familyCalendar.subtitle}</p>
        </header>

        <FamilyCalendarView />
      </AppPage>
    </div>
  );
}
