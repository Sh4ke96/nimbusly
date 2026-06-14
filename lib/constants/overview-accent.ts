export const OVERVIEW_ACCENT = {
  PRIMARY: "primary",
  ORANGE: "orange",
  VIOLET: "violet",
  INDIGO: "indigo",
  AMBER: "amber",
  ROSE: "rose",
  SKY: "sky",
  SLATE: "slate",
  EMERALD: "emerald",
} as const;

export type OverviewAccent = (typeof OVERVIEW_ACCENT)[keyof typeof OVERVIEW_ACCENT];
