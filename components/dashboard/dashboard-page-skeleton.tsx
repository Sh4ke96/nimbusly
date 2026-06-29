import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AppViewShell } from "@/components/app/app-view-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <AppViewShell>
      <AppHeader />
      <AppPage width="full">
        <div className="space-y-6">
          <Skeleton className="h-9 w-64 max-w-full rounded-none" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-none" />
            <Skeleton className="h-10 w-28 rounded-none" />
          </div>
          <Skeleton className="h-24 w-full rounded-none" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-48 w-full rounded-none" />
            <Skeleton className="h-48 w-full rounded-none" />
            <Skeleton className="h-48 w-full rounded-none" />
            <Skeleton className="h-48 w-full rounded-none" />
            <Skeleton className="h-48 w-full rounded-none" />
            <Skeleton className="h-48 w-full rounded-none" />
          </div>
        </div>
      </AppPage>
    </AppViewShell>
  );
}
