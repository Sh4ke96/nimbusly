import { Suspense } from "react";
import { FamilyView } from "@/components/family/family-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function FamilyPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <FamilyView />
    </Suspense>
  );
}
