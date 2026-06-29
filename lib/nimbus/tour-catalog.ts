import { NIMBUS_TOUR_ID, NIMBUS_TOUR_TARGET, type NimbusTourId } from "@/lib/constants/nimbus-tour";

export const NIMBUS_TOUR_PREPARE = {
  DASHBOARD_SUMMARY: "dashboard-summary",
  DASHBOARD_MODULES: "dashboard-modules",
  SETTINGS_PROFILE: "settings-profile",
  SETTINGS_ACCOUNT: "settings-account",
  SETTINGS_FAMILY: "settings-family",
  SETTINGS_PERMISSIONS: "settings-family",
  SETTINGS_PASSWORD: "settings-password",
  SETTINGS_NOTIFICATIONS: "settings-notifications",
} as const;

export type NimbusTourPrepare =
  (typeof NIMBUS_TOUR_PREPARE)[keyof typeof NIMBUS_TOUR_PREPARE];

export type NimbusTourStepVariant = "spotlight" | "summary";

export interface NimbusTourStep {
  id: string;
  route: string;
  target: string;
  copyKey: string;
  prepare?: NimbusTourPrepare;
  variant?: NimbusTourStepVariant;
}

function moduleSteps(
  route: string,
  moduleId: string,
  steps: { id: string; target: string }[]
): NimbusTourStep[] {
  const spotlightSteps = steps.map((step) => ({
    id: step.id,
    route,
    target: step.target,
    copyKey: `${moduleId}.${step.id}`,
    variant: "spotlight" as const,
  }));

  return [
    ...spotlightSteps,
    {
      id: "summary",
      route,
      target: NIMBUS_TOUR_TARGET.TOUR_SUMMARY,
      copyKey: `${moduleId}.summary`,
      variant: "summary" as const,
    },
  ];
}

const INTRO_TOUR: NimbusTourStep[] = [
  {
    id: "dashboard-greeting",
    route: "/dashboard",
    target: NIMBUS_TOUR_TARGET.DASHBOARD_GREETING,
    copyKey: "intro.dashboardGreeting",
    prepare: NIMBUS_TOUR_PREPARE.DASHBOARD_SUMMARY,
  },
  {
    id: "dashboard-tabs",
    route: "/dashboard",
    target: NIMBUS_TOUR_TARGET.DASHBOARD_VIEW_TABS,
    copyKey: "intro.dashboardTabs",
    prepare: NIMBUS_TOUR_PREPARE.DASHBOARD_SUMMARY,
  },
  {
    id: "dashboard-attention",
    route: "/dashboard",
    target: NIMBUS_TOUR_TARGET.DASHBOARD_ATTENTION,
    copyKey: "intro.dashboardAttention",
    prepare: NIMBUS_TOUR_PREPARE.DASHBOARD_SUMMARY,
  },
  {
    id: "dashboard-attention-pin",
    route: "/dashboard",
    target: NIMBUS_TOUR_TARGET.DASHBOARD_ATTENTION_PIN,
    copyKey: "intro.dashboardAttentionPin",
    prepare: NIMBUS_TOUR_PREPARE.DASHBOARD_SUMMARY,
  },
  {
    id: "dashboard-overview",
    route: "/dashboard",
    target: NIMBUS_TOUR_TARGET.DASHBOARD_OVERVIEW,
    copyKey: "intro.dashboardOverview",
    prepare: NIMBUS_TOUR_PREPARE.DASHBOARD_SUMMARY,
  },
  {
    id: "dashboard-layout",
    route: "/dashboard",
    target: NIMBUS_TOUR_TARGET.DASHBOARD_LAYOUT_EDIT,
    copyKey: "intro.dashboardLayout",
    prepare: NIMBUS_TOUR_PREPARE.DASHBOARD_SUMMARY,
  },
  {
    id: "dashboard-modules",
    route: "/dashboard",
    target: NIMBUS_TOUR_TARGET.DASHBOARD_MODULES,
    copyKey: "intro.dashboardModules",
    prepare: NIMBUS_TOUR_PREPARE.DASHBOARD_MODULES,
  },
  {
    id: "global-search",
    route: "/dashboard",
    target: NIMBUS_TOUR_TARGET.GLOBAL_SEARCH_TRIGGER,
    copyKey: "intro.globalSearch",
  },
  {
    id: "settings-nav",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.SETTINGS_NAV,
    copyKey: "intro.settingsNav",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_PROFILE,
  },
  {
    id: "settings-profile",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.SETTINGS_PROFILE,
    copyKey: "intro.settingsProfile",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_PROFILE,
  },
  {
    id: "settings-notifications",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.SETTINGS_NOTIFICATIONS,
    copyKey: "intro.settingsNotifications",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_NOTIFICATIONS,
  },
];

const SETTINGS_SOLO_TOUR: NimbusTourStep[] = [
  {
    id: "account-type",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.SETTINGS_ACCOUNT_TYPE,
    copyKey: "settingsSolo.accountType",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_ACCOUNT,
  },
  {
    id: "join-family",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.SETTINGS_JOIN_FAMILY,
    copyKey: "settingsSolo.joinFamily",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_ACCOUNT,
  },
  {
    id: "create-family",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.SETTINGS_CREATE_FAMILY,
    copyKey: "settingsSolo.createFamily",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_ACCOUNT,
  },
  {
    id: "password",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.SETTINGS_PASSWORD,
    copyKey: "settingsSolo.password",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_PASSWORD,
  },
  {
    id: "summary",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.TOUR_SUMMARY,
    copyKey: "settingsSolo.summary",
    variant: "summary",
  },
];

const NOTIFICATIONS_TOUR: NimbusTourStep[] = moduleSteps("/notifications", "notifications", [
  { id: "header", target: NIMBUS_TOUR_TARGET.NOTIFICATIONS_HEADER },
  { id: "filters", target: NIMBUS_TOUR_TARGET.NOTIFICATIONS_FILTERS },
  { id: "list", target: NIMBUS_TOUR_TARGET.NOTIFICATIONS_LIST },
]);

const FAMILY_TOUR: NimbusTourStep[] = [
  {
    id: "family-tab",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.FAMILY_SETTINGS_TAB,
    copyKey: "family.familyTab",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_FAMILY,
  },
  {
    id: "members",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.FAMILY_MEMBERS,
    copyKey: "family.members",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_FAMILY,
  },
  {
    id: "member-roles",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.FAMILY_PERMISSIONS,
    copyKey: "family.memberRoles",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_FAMILY,
  },
  {
    id: "leave-family",
    route: "/profile/settings",
    target: NIMBUS_TOUR_TARGET.FAMILY_LEAVE,
    copyKey: "family.leaveFamily",
    prepare: NIMBUS_TOUR_PREPARE.SETTINGS_FAMILY,
  },
  {
    id: "realtime",
    route: "/shopping",
    target: NIMBUS_TOUR_TARGET.FAMILY_REALTIME,
    copyKey: "family.realtime",
  },
  {
    id: "summary",
    route: "/shopping",
    target: NIMBUS_TOUR_TARGET.TOUR_SUMMARY,
    copyKey: "family.summary",
    variant: "summary",
  },
];

export const NIMBUS_TOUR_CATALOG: Record<NimbusTourId, NimbusTourStep[]> = {
  [NIMBUS_TOUR_ID.INTRO]: INTRO_TOUR,
  [NIMBUS_TOUR_ID.FAMILY]: FAMILY_TOUR,
  [NIMBUS_TOUR_ID.SETTINGS_SOLO]: SETTINGS_SOLO_TOUR,
  [NIMBUS_TOUR_ID.NOTIFICATIONS]: NOTIFICATIONS_TOUR,
  [NIMBUS_TOUR_ID.BUDGET]: moduleSteps("/budget", "budget", [
    { id: "header", target: NIMBUS_TOUR_TARGET.BUDGET_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.BUDGET_ADD },
    { id: "lists", target: NIMBUS_TOUR_TARGET.BUDGET_LISTS },
    { id: "hidden", target: NIMBUS_TOUR_TARGET.BUDGET_HIDDEN },
    { id: "detail", target: NIMBUS_TOUR_TARGET.BUDGET_DETAIL },
    { id: "income", target: NIMBUS_TOUR_TARGET.BUDGET_INCOME },
    { id: "filters", target: NIMBUS_TOUR_TARGET.BUDGET_FILTERS },
    { id: "export", target: NIMBUS_TOUR_TARGET.BUDGET_EXPORT },
  ]),
  [NIMBUS_TOUR_ID.SHOPPING]: moduleSteps("/shopping", "shopping", [
    { id: "header", target: NIMBUS_TOUR_TARGET.SHOPPING_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.SHOPPING_ADD },
    { id: "lists", target: NIMBUS_TOUR_TARGET.SHOPPING_LISTS },
    { id: "items", target: NIMBUS_TOUR_TARGET.SHOPPING_ITEMS },
    { id: "categories", target: NIMBUS_TOUR_TARGET.SHOPPING_CATEGORIES },
    { id: "addItem", target: NIMBUS_TOUR_TARGET.SHOPPING_ADD_ITEM },
  ]),
  [NIMBUS_TOUR_ID.GIFTS]: moduleSteps("/gifts", "gifts", [
    { id: "header", target: NIMBUS_TOUR_TARGET.GIFTS_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.GIFTS_ADD },
    { id: "filters", target: NIMBUS_TOUR_TARGET.GIFTS_FILTERS },
    { id: "list", target: NIMBUS_TOUR_TARGET.GIFTS_LIST },
  ]),
  [NIMBUS_TOUR_ID.BIRTHDAYS]: moduleSteps("/birthdays", "birthdays", [
    { id: "header", target: NIMBUS_TOUR_TARGET.BIRTHDAYS_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.BIRTHDAYS_ADD },
    { id: "calendar", target: NIMBUS_TOUR_TARGET.BIRTHDAYS_CALENDAR },
    { id: "list", target: NIMBUS_TOUR_TARGET.BIRTHDAYS_LIST },
  ]),
  [NIMBUS_TOUR_ID.SCHEDULE]: moduleSteps("/schedule", "schedule", [
    { id: "header", target: NIMBUS_TOUR_TARGET.SCHEDULE_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.SCHEDULE_ADD },
    { id: "multiday", target: NIMBUS_TOUR_TARGET.SCHEDULE_MULTIDAY },
    { id: "calendar", target: NIMBUS_TOUR_TARGET.SCHEDULE_CALENDAR },
    { id: "list", target: NIMBUS_TOUR_TARGET.SCHEDULE_LIST },
    { id: "print", target: NIMBUS_TOUR_TARGET.SCHEDULE_PRINT },
  ]),
  [NIMBUS_TOUR_ID.MEDICINE]: moduleSteps("/medicine-cabinet", "medicine", [
    { id: "header", target: NIMBUS_TOUR_TARGET.MEDICINE_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.MEDICINE_ADD },
    { id: "filters", target: NIMBUS_TOUR_TARGET.MEDICINE_FILTERS },
    { id: "list", target: NIMBUS_TOUR_TARGET.MEDICINE_LIST },
  ]),
  [NIMBUS_TOUR_ID.WATCHLIST]: moduleSteps("/watchlist", "watchlist", [
    { id: "header", target: NIMBUS_TOUR_TARGET.WATCHLIST_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.WATCHLIST_ADD },
    { id: "platforms", target: NIMBUS_TOUR_TARGET.WATCHLIST_PLATFORMS },
    { id: "status", target: NIMBUS_TOUR_TARGET.WATCHLIST_STATUS },
    { id: "filters", target: NIMBUS_TOUR_TARGET.WATCHLIST_FILTERS },
    { id: "list", target: NIMBUS_TOUR_TARGET.WATCHLIST_LIST },
  ]),
  [NIMBUS_TOUR_ID.RESTAURANTS]: moduleSteps("/restaurants", "restaurants", [
    { id: "header", target: NIMBUS_TOUR_TARGET.RESTAURANTS_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.RESTAURANTS_ADD },
    { id: "filters", target: NIMBUS_TOUR_TARGET.RESTAURANTS_FILTERS },
    { id: "list", target: NIMBUS_TOUR_TARGET.RESTAURANTS_LIST },
  ]),
  [NIMBUS_TOUR_ID.PETS]: moduleSteps("/pets", "pets", [
    { id: "header", target: NIMBUS_TOUR_TARGET.PETS_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.PETS_ADD },
    { id: "care", target: NIMBUS_TOUR_TARGET.PETS_CARE },
    { id: "filters", target: NIMBUS_TOUR_TARGET.PETS_FILTERS },
    { id: "list", target: NIMBUS_TOUR_TARGET.PETS_LIST },
  ]),
  [NIMBUS_TOUR_ID.CHORES]: moduleSteps("/chores", "chores", [
    { id: "header", target: NIMBUS_TOUR_TARGET.CHORES_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.CHORES_ADD },
    { id: "assign", target: NIMBUS_TOUR_TARGET.CHORES_ASSIGN },
    { id: "recurrence", target: NIMBUS_TOUR_TARGET.CHORES_RECURRENCE },
    { id: "viewToggle", target: NIMBUS_TOUR_TARGET.CHORES_VIEW_TOGGLE },
    { id: "filters", target: NIMBUS_TOUR_TARGET.CHORES_FILTERS },
    { id: "list", target: NIMBUS_TOUR_TARGET.CHORES_LIST },
  ]),
  [NIMBUS_TOUR_ID.NOTES]: moduleSteps("/notes", "notes", [
    { id: "header", target: NIMBUS_TOUR_TARGET.NOTES_HEADER },
    { id: "add", target: NIMBUS_TOUR_TARGET.NOTES_ADD },
    { id: "pin", target: NIMBUS_TOUR_TARGET.NOTES_PIN },
    { id: "visibility", target: NIMBUS_TOUR_TARGET.NOTES_VISIBILITY },
    { id: "category", target: NIMBUS_TOUR_TARGET.NOTES_CATEGORY },
    { id: "filters", target: NIMBUS_TOUR_TARGET.NOTES_FILTERS },
    { id: "list", target: NIMBUS_TOUR_TARGET.NOTES_LIST },
  ]),
};

export function getNimbusTourSteps(tourId: NimbusTourId): NimbusTourStep[] {
  return NIMBUS_TOUR_CATALOG[tourId] ?? [];
}

export function isModuleTourId(tourId: NimbusTourId): boolean {
  return (
    tourId !== NIMBUS_TOUR_ID.INTRO &&
    tourId !== NIMBUS_TOUR_ID.FAMILY &&
    tourId !== NIMBUS_TOUR_ID.SETTINGS_SOLO
  );
}
