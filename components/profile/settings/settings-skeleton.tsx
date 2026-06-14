import { Fragment } from "react";
import { AppHeader } from "@/components/app/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-none" />
          <Skeleton className="h-3 w-3 rounded-none" />
          <Skeleton className="h-4 w-28 rounded-none" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-none" />
          <Skeleton className="h-4 w-72 max-w-full rounded-none" />
        </div>

        <Card className="gap-0 rounded-none py-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)]">
              <aside className="border-b border-border bg-muted/30 p-2 md:border-b-0 md:border-r">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Fragment key={i}>
                    {i > 0 && <Separator />}
                    <Skeleton className="h-12 w-full rounded-none" />
                  </Fragment>
                ))}
              </aside>
              <div className="min-w-0 p-6 md:p-8">
                <div className="mb-8 flex items-center gap-3 border-b border-border pb-6">
                  <Skeleton className="size-10 rounded-none" />
                  <Skeleton className="h-7 w-40 rounded-none" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="size-12 rounded-none" />
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="size-9 rounded-none" />
                    ))}
                  </div>
                  <Skeleton className="h-10 w-full rounded-none" />
                  <Skeleton className="h-10 w-full rounded-none" />
                  <Skeleton className="h-9 w-24 rounded-none" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
