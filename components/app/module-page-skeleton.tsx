import { Skeleton } from "@/components/ui/skeleton";

export function ModulePageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 max-w-full rounded-none" />
      <Skeleton className="h-64 w-full rounded-none" />
    </div>
  );
}
