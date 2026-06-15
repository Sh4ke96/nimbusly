export const DASHBOARD_VIEW = {
  SUMMARY: "summary",
  MODULES: "modules",
} as const;

export type DashboardView = (typeof DASHBOARD_VIEW)[keyof typeof DASHBOARD_VIEW];

export const DASHBOARD_VIEWS = [
  DASHBOARD_VIEW.SUMMARY,
  DASHBOARD_VIEW.MODULES,
] as const;
