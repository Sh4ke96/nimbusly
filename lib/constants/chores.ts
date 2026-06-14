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

export type ChoreStatus = (typeof CHORE_STATUSES)[number];

export const CHORE_RECURRENCE = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
} as const;

export const CHORE_RECURRENCES = [
  CHORE_RECURRENCE.NONE,
  CHORE_RECURRENCE.DAILY,
  CHORE_RECURRENCE.WEEKLY,
  CHORE_RECURRENCE.BIWEEKLY,
  CHORE_RECURRENCE.MONTHLY,
] as const;

export type ChoreRecurrence = (typeof CHORE_RECURRENCES)[number];

export const CHORE_FILTER_ALL = "all";
export const CHORE_ASSIGNEE_UNASSIGNED = "unassigned";

export const CHORE_TITLE_MAX_LENGTH = 120;
export const CHORE_NOTES_MAX_LENGTH = 500;
