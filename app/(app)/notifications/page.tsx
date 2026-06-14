import { Suspense } from "react";
import { NotificationsView } from "@/components/notifications/notifications-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function NotificationsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-md rounded-none" />
      <Card className="rounded-none py-0 shadow-sm">
        <CardContent className="space-y-2 p-4">
          <Skeleton className="h-16 w-full rounded-none" />
          <Skeleton className="h-16 w-full rounded-none" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsView />
    </Suspense>
  );
}
