import { Suspense } from "react";
import { ShoppingListsView } from "@/components/shopping/shopping-lists-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function ShoppingPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <ShoppingListsView />
    </Suspense>
  );
}
