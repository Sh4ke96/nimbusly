import { Suspense } from "react";
import { BirthdaysView } from "@/components/birthdays/birthdays-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function BirthdaysPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <BirthdaysView />
    </Suspense>
  );
}
