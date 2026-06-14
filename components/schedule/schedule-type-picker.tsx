"use client";

import { Label } from "@/components/ui/label";
import {
  SCHEDULE_ENTRY_EMOJI,
  SCHEDULE_ENTRY_TYPES,
  type ScheduleEntryType,
} from "@/lib/constants/schedule";
import { useT } from "@/lib/lang-context";
import { getScheduleTypeLabel, SCHEDULE_FORM_FIELD } from "@/lib/schedule/types";
import { scheduleTypeChipClass } from "@/lib/schedule/type-styles";
import { cn } from "@/lib/utils";

interface ScheduleTypePickerProps {
  value: ScheduleEntryType | "";
  onChange: (type: ScheduleEntryType) => void;
  name?: string;
}

export function ScheduleTypePicker({ value, onChange, name = SCHEDULE_FORM_FIELD.ENTRY_TYPE }: ScheduleTypePickerProps) {
  const t = useT();

  return (
    <div className="space-y-2">
      <Label>{t.schedule.typeLabel}</Label>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SCHEDULE_ENTRY_TYPES.map((type) => {
          const selected = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-none border border-border px-3 py-2.5 text-left text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/10"
                  : "bg-background hover:bg-muted/60"
              )}
            >
              <span className="text-lg leading-none" aria-hidden>
                {SCHEDULE_ENTRY_EMOJI[type]}
              </span>
              <span className="font-medium">{getScheduleTypeLabel(type, t.schedule.typeLabels)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ScheduleTypeBadge({
  type,
  selected = false,
  className,
}: {
  type: ScheduleEntryType;
  selected?: boolean;
  className?: string;
}) {
  const t = useT();

  return (
    <span className={cn(scheduleTypeChipClass(type, selected), className)}>
      <span className="shrink-0 text-xs leading-none" aria-hidden>
        {SCHEDULE_ENTRY_EMOJI[type]}
      </span>
      <span className="min-w-0 truncate">
        {getScheduleTypeLabel(type, t.schedule.typeLabels)}
      </span>
    </span>
  );
}
