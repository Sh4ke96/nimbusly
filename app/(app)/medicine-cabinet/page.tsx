import { Suspense } from "react";
import { MedicineView } from "@/components/medicine-cabinet/medicine-cabinet-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function MedicineCabinetPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <MedicineView />
    </Suspense>
  );
}
