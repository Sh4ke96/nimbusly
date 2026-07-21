export const CHORE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export const CHORE_STATUSES = [
  CHORE_STATUS.PENDING,
  CHORE_STATUS.IN_PROGRESS,
  CHORE_STATUS.COMPLETED,
] as const;

/** Status options shown in forms, filters, and quick actions. */
export const CHORE_FORM_STATUSES = [
  CHORE_STATUS.PENDING,
  CHORE_STATUS.COMPLETED,
] as const;

export type ChoreFormStatus = (typeof CHORE_FORM_STATUSES)[number];

export type ChoreStatus = (typeof CHORE_STATUSES)[number];

export const CHORE_RECURRENCE = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
  CUSTOM: "custom",
} as const;

export const CHORE_RECURRENCES = [
  CHORE_RECURRENCE.NONE,
  CHORE_RECURRENCE.DAILY,
  CHORE_RECURRENCE.WEEKLY,
  CHORE_RECURRENCE.BIWEEKLY,
  CHORE_RECURRENCE.MONTHLY,
  CHORE_RECURRENCE.CUSTOM,
] as const;

export type ChoreRecurrence = (typeof CHORE_RECURRENCES)[number];

export const CHORE_RECURRENCE_DURATION = {
  MONTH: "month",
  QUARTER: "quarter",
  HALF_YEAR: "half_year",
  YEAR: "year",
} as const;

export const CHORE_RECURRENCE_DURATIONS = [
  CHORE_RECURRENCE_DURATION.MONTH,
  CHORE_RECURRENCE_DURATION.QUARTER,
  CHORE_RECURRENCE_DURATION.HALF_YEAR,
  CHORE_RECURRENCE_DURATION.YEAR,
] as const;

export type ChoreRecurrenceDuration = (typeof CHORE_RECURRENCE_DURATIONS)[number];

export const CHORE_CUSTOM_INTERVAL_MIN = 2;
export const CHORE_CUSTOM_INTERVAL_MAX = 90;

export const CHORE_FILTER_ALL = "all";
export const CHORE_ASSIGNEE_UNASSIGNED = "unassigned";

export const CHORE_TITLE_MAX_LENGTH = 120;
export const CHORE_NOTES_MAX_LENGTH = 500;
export const CHORE_ICON_EMOJI_MAX_LENGTH = 16;
