"use client";

import { ModulePageHeader, ModulePageShell } from "@/components/app/module-page-shell";
import { FamilyCalendarView } from "@/components/calendar/family-calendar-view";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { useT } from "@/lib/lang-context";

export function FamilyCalendarPage() {
  const t = useT();

  return (
    <ModulePageShell width="full">
      <ModulePageHeader
        title={t.familyCalendar.title}
        subtitle={t.familyCalendar.subtitle}
        moduleId={APP_MODULE.FAMILY_CALENDAR}
        breadcrumb={t.familyCalendar.title}
        tourTarget={NIMBUS_TOUR_TARGET.FAMILY_CALENDAR_HEADER}
      />

      <FamilyCalendarView />
    </ModulePageShell>
  );
}
