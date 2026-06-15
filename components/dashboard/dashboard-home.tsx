"use client";

import { DashboardModulesGrid, type DashboardModuleItem } from "@/components/dashboard/dashboard-modules-grid";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardViewTabs } from "@/components/dashboard/dashboard-view-tabs";
import { DASHBOARD_VIEW, type DashboardView } from "@/lib/constants/dashboard";
import { useState } from "react";

interface DashboardHomeProps {
  modules: DashboardModuleItem[];
}

export function DashboardHome({ modules }: DashboardHomeProps) {
  const [view, setView] = useState<DashboardView>(DASHBOARD_VIEW.SUMMARY);

  return (
    <div className="space-y-6">
      <DashboardViewTabs value={view} onChange={setView} />

      {view === DASHBOARD_VIEW.SUMMARY ? (
        <DashboardOverview />
      ) : (
        <DashboardModulesGrid modules={modules} />
      )}
    </div>
  );
}
