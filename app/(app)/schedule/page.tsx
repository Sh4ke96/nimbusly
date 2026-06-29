import { Suspense } from "react";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function SchedulePage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <ScheduleView />
    </Suspense>
  );
}
