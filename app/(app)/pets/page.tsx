import { Suspense } from "react";
import { PetsView } from "@/components/pets/pets-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function PetsPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <PetsView />
    </Suspense>
  );
}
