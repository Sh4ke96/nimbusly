import { Suspense } from "react";
import { ChoresView } from "@/components/chores/chores-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function ChoresPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <ChoresView />
    </Suspense>
  );
}
