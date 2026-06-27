import { DASHBOARD_VIEW, type DashboardView } from "@/lib/constants/dashboard";

export function buildDashboardHref(view: DashboardView): string {
  if (view === DASHBOARD_VIEW.MODULES) {
    return `/dashboard?view=${DASHBOARD_VIEW.MODULES}`;
  }
  return "/dashboard";
}
