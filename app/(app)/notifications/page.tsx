import { Suspense } from "react";
import { NotificationsView } from "@/components/notifications/notifications-view";
import { ModulePageSkeleton } from "@/components/app/module-page-skeleton";

export default function NotificationsPage() {
  return (
    <Suspense fallback={<ModulePageSkeleton />}>
      <NotificationsView />
    </Suspense>
  );
}
