import { Suspense } from "react";
import { GiftsView } from "@/components/gifts/gifts-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function GiftsPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <GiftsView />
    </Suspense>
  );
}
