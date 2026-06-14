/** Maximum schedule entries allowed on a single calendar day (solo or shared family day). */
export const SCHEDULE_MAX_ENTRIES_PER_DAY = 3;

export const SCHEDULE_ENTRY_TYPE = {
  WORK: "work",
  FREE: "free",
  SHOPPING: "shopping",
  TRAINING: "training",
  DOCTOR: "doctor",
  TRIP: "trip",
} as const;

export type ScheduleEntryType =
  (typeof SCHEDULE_ENTRY_TYPE)[keyof typeof SCHEDULE_ENTRY_TYPE];

export const SCHEDULE_ENTRY_TYPES = Object.values(
  SCHEDULE_ENTRY_TYPE
) as ScheduleEntryType[];

export const SCHEDULE_ENTRY_EMOJI: Record<ScheduleEntryType, string> = {
  [SCHEDULE_ENTRY_TYPE.WORK]: "💼",
  [SCHEDULE_ENTRY_TYPE.FREE]: "🏖️",
  [SCHEDULE_ENTRY_TYPE.SHOPPING]: "🛒",
  [SCHEDULE_ENTRY_TYPE.TRAINING]: "🏋️",
  [SCHEDULE_ENTRY_TYPE.DOCTOR]: "🩺",
  [SCHEDULE_ENTRY_TYPE.TRIP]: "✈️",
};
