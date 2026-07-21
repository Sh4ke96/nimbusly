import { Suspense } from "react";
import { BudgetView } from "@/components/budget/budget-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function BudgetPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <BudgetView />
    </Suspense>
  );
}
