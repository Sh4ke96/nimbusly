import { Suspense } from "react";
import DashboardPageClient from "./dashboard-page-client";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardPageClient />
    </Suspense>
  );
}
