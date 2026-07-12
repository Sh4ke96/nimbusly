import {
  APP_MODULE,
  APP_MODULE_NAV_IDS,
  type AppModuleId,
} from "@/lib/constants/app-modules";

export const DEMO_ROUTE = "/demo" as const;

export const DEMO_SECTION_ID = "demo" as const;

export const DEMO_VIEW = {
  DASHBOARD: "dashboard",
  ...APP_MODULE,
} as const;

export type DemoViewId = (typeof DEMO_VIEW)[keyof typeof DEMO_VIEW];

export const DEMO_NAV_VIEWS: DemoViewId[] = [
  DEMO_VIEW.DASHBOARD,
  ...APP_MODULE_NAV_IDS,
  DEMO_VIEW.FAMILY,
];

export function isDemoModuleView(view: DemoViewId): view is AppModuleId {
  return view !== DEMO_VIEW.DASHBOARD;
}
