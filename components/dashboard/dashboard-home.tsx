"use client";

import { DashboardModulesGrid, type DashboardModuleItem } from "@/components/dashboard/dashboard-modules-grid";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardViewTabs } from "@/components/dashboard/dashboard-view-tabs";
import { DASHBOARD_VIEW, type DashboardView } from "@/lib/constants/dashboard";
import { NIMBUS_DASHBOARD_VIEW_EVENT, NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { useEffect, useState } from "react";

interface DashboardHomeProps {
  modules: DashboardModuleItem[];
}

export function DashboardHome({ modules }: DashboardHomeProps) {
  const [view, setView] = useState<DashboardView>(DASHBOARD_VIEW.SUMMARY);

  useEffect(() => {
    function onDashboardView(event: Event) {
      setView((event as CustomEvent<DashboardView>).detail);
    }

    window.addEventListener(NIMBUS_DASHBOARD_VIEW_EVENT, onDashboardView);
    return () => window.removeEventListener(NIMBUS_DASHBOARD_VIEW_EVENT, onDashboardView);
  }, []);

  return (
    <div className="space-y-6">
      <div data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_VIEW_TABS}>
        <DashboardViewTabs value={view} onChange={setView} />
      </div>

      {view === DASHBOARD_VIEW.SUMMARY ? (
        <DashboardOverview />
      ) : (
        <div data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_MODULES}>
          <DashboardModulesGrid modules={modules} />
        </div>
      )}
    </div>
  );
}
