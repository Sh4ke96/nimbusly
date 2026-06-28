import { Suspense } from "react";
import { BudgetView } from "@/components/budget/budget-view";
import { Skeleton } from "@/components/ui/skeleton";

function BudgetSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 rounded-none" />
      <Skeleton className="h-64 w-full rounded-none" />
    </div>
  );
}

export default function BudgetPage() {
  return (
    <Suspense fallback={<BudgetSkeleton />}>
      <BudgetView />
    </Suspense>
  );
}
