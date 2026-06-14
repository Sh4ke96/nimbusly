import type { ScheduleEntryType } from "@/lib/constants/schedule";
import { cn } from "@/lib/utils";

export const SCHEDULE_TYPE_CHIP_CLASS: Record<ScheduleEntryType, string> = {
  work: "bg-primary/15 text-primary hover:bg-primary/25",
  free: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25",
  shopping: "bg-amber-500/15 text-amber-800 dark:text-amber-200 hover:bg-amber-500/25",
  training: "bg-orange-500/15 text-orange-800 dark:text-orange-200 hover:bg-orange-500/25",
  doctor: "bg-rose-500/15 text-rose-800 dark:text-rose-200 hover:bg-rose-500/25",
  trip: "bg-sky-500/15 text-sky-800 dark:text-sky-200 hover:bg-sky-500/25",
};

export const SCHEDULE_TYPE_SELECTED_CLASS: Record<ScheduleEntryType, string> = {
  work: "bg-primary text-primary-foreground ring-1 ring-primary/40",
  free: "bg-emerald-600 text-white ring-1 ring-emerald-600/40",
  shopping: "bg-amber-600 text-white ring-1 ring-amber-600/40",
  training: "bg-orange-600 text-white ring-1 ring-orange-600/40",
  doctor: "bg-rose-600 text-white ring-1 ring-rose-600/40",
  trip: "bg-sky-600 text-white ring-1 ring-sky-600/40",
};

export function scheduleTypeChipClass(
  type: ScheduleEntryType,
  selected: boolean
): string {
  return cn(
    "inline-flex max-w-full min-w-0 items-center gap-1 rounded-sm px-1.5 py-1 text-[11px] font-medium leading-none transition-all duration-150",
    selected ? SCHEDULE_TYPE_SELECTED_CLASS[type] : SCHEDULE_TYPE_CHIP_CLASS[type]
  );
}
