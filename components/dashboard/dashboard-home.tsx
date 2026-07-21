"use client";

import { DashboardModulesGrid, type DashboardModuleItem } from "@/components/dashboard/dashboard-modules-grid";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardViewTabs } from "@/components/dashboard/dashboard-view-tabs";
import { DASHBOARD_VIEW, type DashboardView } from "@/lib/constants/dashboard";
import { NIMBUS_DASHBOARD_VIEW_EVENT, NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { MOBILE_MODULES_SHEET_OPEN_EVENT } from "@/lib/constants/mobile-nav";
import { buildDashboardHref } from "@/lib/dashboard/view-href";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

interface DashboardHomeProps {
  modules: DashboardModuleItem[];
  initialView?: DashboardView;
}

export function DashboardHome({
  modules,
  initialView = DASHBOARD_VIEW.SUMMARY,
}: DashboardHomeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = initialView;

  const applyView = useCallback(
    (nextView: DashboardView) => {
      if (pathname !== "/dashboard") return;

      const href = buildDashboardHref(nextView);
      const currentHref =
        searchParams.toString().length > 0
          ? `${pathname}?${searchParams.toString()}`
          : pathname;

      if (currentHref !== href) {
        router.replace(href, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    function onDashboardView(event: Event) {
      applyView((event as CustomEvent<DashboardView>).detail);
    }

    window.addEventListener(NIMBUS_DASHBOARD_VIEW_EVENT, onDashboardView);
    return () => window.removeEventListener(NIMBUS_DASHBOARD_VIEW_EVENT, onDashboardView);
  }, [applyView]);

  useEffect(() => {
    if (view !== DASHBOARD_VIEW.MODULES) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    window.dispatchEvent(new Event(MOBILE_MODULES_SHEET_OPEN_EVENT));
    applyView(DASHBOARD_VIEW.SUMMARY);
  }, [view, applyView]);

  return (
    <div className="space-y-6">
      <div className="hidden md:block" data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_VIEW_TABS}>
        <DashboardViewTabs value={view} onChange={applyView} />
      </div>

      {view === DASHBOARD_VIEW.SUMMARY ? (
        <DashboardOverview />
      ) : (
        <div className="hidden md:block" data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_MODULES}>
          <DashboardModulesGrid modules={modules} />
        </div>
      )}
    </div>
  );
}
