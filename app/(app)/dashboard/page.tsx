import { Suspense } from "react";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { loadDashboardSnapshot } from "@/lib/dashboard/load-dashboard-snapshot";
import DashboardPageClient from "./dashboard-page-client";

export default async function DashboardPage() {
  const snapshot = await loadDashboardSnapshot();

  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardPageClient snapshot={snapshot} />
    </Suspense>
  );
}
