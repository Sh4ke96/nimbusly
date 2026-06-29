import { Suspense } from "react";
import { WatchlistView } from "@/components/watchlist/watchlist-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function WatchlistPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <WatchlistView />
    </Suspense>
  );
}
