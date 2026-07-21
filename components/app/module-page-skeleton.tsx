import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AppViewShell } from "@/components/app/app-view-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function ModulePageSkeleton() {
  return (
    <AppViewShell>
      <div className="no-print">
        <AppHeader />
      </div>
      <AppPage width="default">
        <div className="space-y-6 no-print">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 shrink-0 rounded-none" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-8 w-48 max-w-full rounded-none" />
              <Skeleton className="h-4 w-64 max-w-full rounded-none" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-none" />
        </div>
      </AppPage>
    </AppViewShell>
  );
}
