import { AppHeader } from "@/components/app/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-none" />
          <Skeleton className="h-3 w-3 rounded-none" />
          <Skeleton className="h-4 w-28 rounded-none" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-none" />
          <Skeleton className="h-4 w-72 max-w-full rounded-none" />
        </div>

        <Card className="rounded-none shadow-sm">
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4 border-b border-border pb-3">
              <Skeleton className="h-9 w-24 rounded-none" />
              <Skeleton className="h-9 w-28 rounded-none" />
              <Skeleton className="h-9 w-24 rounded-none" />
            </div>
            <div className="space-y-4 pt-2">
              <Skeleton className="size-12 rounded-none" />
              <div className="flex gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="size-9 rounded-none" />
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
              <Skeleton className="h-9 w-24 rounded-none" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
