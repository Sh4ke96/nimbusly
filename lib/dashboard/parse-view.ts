import { DASHBOARD_VIEW, type DashboardView } from "@/lib/constants/dashboard";

export function parseDashboardView(value: string | null | undefined): DashboardView {
  if (value === DASHBOARD_VIEW.MODULES) return DASHBOARD_VIEW.MODULES;
  return DASHBOARD_VIEW.SUMMARY;
}
