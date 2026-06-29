import { Suspense } from "react";
import { RestaurantsView } from "@/components/restaurants/restaurants-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <RestaurantsView />
    </Suspense>
  );
}
