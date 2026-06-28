import { Suspense } from "react";
import { ShoppingListsView } from "@/components/shopping/shopping-lists-view";
import { Skeleton } from "@/components/ui/skeleton";

function ShoppingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 rounded-none" />
      <Skeleton className="h-64 w-full rounded-none" />
    </div>
  );
}

export default function ShoppingPage() {
  return (
    <Suspense fallback={<ShoppingSkeleton />}>
      <ShoppingListsView />
    </Suspense>
  );
}
