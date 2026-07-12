import { Suspense } from "react";
import { FamilyCalendarPage } from "@/components/calendar/family-calendar-page";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function CalendarRoutePage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <FamilyCalendarPage />
    </Suspense>
  );
}
