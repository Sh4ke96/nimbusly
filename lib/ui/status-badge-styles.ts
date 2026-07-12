import type { OverviewAccent } from "@/lib/constants/overview-accent";

export const STATUS_BADGE_TONE = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
  NEUTRAL: "neutral",
} as const;

export type StatusBadgeTone = (typeof STATUS_BADGE_TONE)[keyof typeof STATUS_BADGE_TONE];

export const statusBadgeStyles: Record<StatusBadgeTone, string> = {
  [STATUS_BADGE_TONE.INFO]:
    "bg-primary/10 text-primary border-primary/25",
  [STATUS_BADGE_TONE.SUCCESS]:
    "bg-primary/10 text-primary border-primary/25",
  [STATUS_BADGE_TONE.WARNING]:
    "bg-attention/10 text-attention border-attention/30",
  [STATUS_BADGE_TONE.DANGER]:
    "bg-destructive/10 text-destructive border-destructive/25",
  [STATUS_BADGE_TONE.NEUTRAL]:
    "bg-muted text-muted-foreground border-border",
};

/** Map dashboard overview accent keys to semantic badge tones where possible. */
export const overviewAccentToStatusTone: Record<OverviewAccent, StatusBadgeTone> = {
  primary: STATUS_BADGE_TONE.INFO,
  orange: STATUS_BADGE_TONE.WARNING,
  violet: STATUS_BADGE_TONE.INFO,
  indigo: STATUS_BADGE_TONE.INFO,
  amber: STATUS_BADGE_TONE.WARNING,
  rose: STATUS_BADGE_TONE.DANGER,
  sky: STATUS_BADGE_TONE.INFO,
  slate: STATUS_BADGE_TONE.NEUTRAL,
  emerald: STATUS_BADGE_TONE.SUCCESS,
  teal: STATUS_BADGE_TONE.SUCCESS,
  lime: STATUS_BADGE_TONE.SUCCESS,
  fuchsia: STATUS_BADGE_TONE.INFO,
};

export const familyCalendarEventStyles = {
  birthday: "bg-rose-500/15 text-rose-900 dark:text-rose-200 border-rose-500/25",
  schedule: "bg-sky-500/15 text-sky-900 dark:text-sky-200 border-sky-500/25",
  chore: "bg-teal-500/15 text-teal-900 dark:text-teal-200 border-teal-500/25",
} as const;

export const familyCalendarLegendStyles = {
  birthday: "border-rose-500/40 bg-rose-500/20",
  schedule: "border-sky-500/40 bg-sky-500/20",
  chore: "border-teal-500/40 bg-teal-500/20",
} as const;
