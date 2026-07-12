import {
  Briefcase,
  Palmtree,
  ShoppingCart,
  Dumbbell,
  Stethoscope,
  Plane,
  type LucideIcon,
} from "lucide-react";
import {
  SCHEDULE_ENTRY_TYPE,
  type ScheduleEntryType,
} from "@/lib/constants/schedule";

export const SCHEDULE_ENTRY_ICON: Record<ScheduleEntryType, LucideIcon> = {
  [SCHEDULE_ENTRY_TYPE.WORK]: Briefcase,
  [SCHEDULE_ENTRY_TYPE.FREE]: Palmtree,
  [SCHEDULE_ENTRY_TYPE.SHOPPING]: ShoppingCart,
  [SCHEDULE_ENTRY_TYPE.TRAINING]: Dumbbell,
  [SCHEDULE_ENTRY_TYPE.DOCTOR]: Stethoscope,
  [SCHEDULE_ENTRY_TYPE.TRIP]: Plane,
};

export function getScheduleEntryIcon(type: ScheduleEntryType): LucideIcon {
  return SCHEDULE_ENTRY_ICON[type];
}
