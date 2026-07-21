import { SCHEDULE_ENTRY_TYPE, type ScheduleEntryType } from "@/lib/constants/schedule";

export const scheduleEntryBarStyles: Record<ScheduleEntryType, string> = {
  [SCHEDULE_ENTRY_TYPE.WORK]: "bg-blue-600",
  [SCHEDULE_ENTRY_TYPE.FREE]: "bg-emerald-500",
  [SCHEDULE_ENTRY_TYPE.SHOPPING]: "bg-amber-500",
  [SCHEDULE_ENTRY_TYPE.TRAINING]: "bg-violet-500",
  [SCHEDULE_ENTRY_TYPE.DOCTOR]: "bg-rose-500",
  [SCHEDULE_ENTRY_TYPE.TRIP]: "bg-indigo-500",
};

export const scheduleEntryLegendStyles: Record<ScheduleEntryType, string> = {
  [SCHEDULE_ENTRY_TYPE.WORK]: "border-blue-600/40 bg-blue-600/20",
  [SCHEDULE_ENTRY_TYPE.FREE]: "border-emerald-500/40 bg-emerald-500/20",
  [SCHEDULE_ENTRY_TYPE.SHOPPING]: "border-amber-500/40 bg-amber-500/20",
  [SCHEDULE_ENTRY_TYPE.TRAINING]: "border-violet-500/40 bg-violet-500/20",
  [SCHEDULE_ENTRY_TYPE.DOCTOR]: "border-rose-500/40 bg-rose-500/20",
  [SCHEDULE_ENTRY_TYPE.TRIP]: "border-indigo-500/40 bg-indigo-500/20",
};
