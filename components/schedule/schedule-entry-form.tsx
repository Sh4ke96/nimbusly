"use client";

import type { DateRange } from "react-day-picker";
import { SCHEDULE_FORM_FIELD } from "@/lib/schedule/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScheduleDatePicker } from "@/components/schedule/schedule-date-picker";
import { ScheduleTypePicker } from "@/components/schedule/schedule-type-picker";
import type { ScheduleEntryType } from "@/lib/constants/schedule";
import { useT } from "@/lib/lang-context";

interface ScheduleEntryFormProps {
  id?: string;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  entryType: ScheduleEntryType | "";
  onEntryTypeChange: (type: ScheduleEntryType) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export function ScheduleEntryForm({
  id,
  range,
  onRangeChange,
  entryType,
  onEntryTypeChange,
  description,
  onDescriptionChange,
}: ScheduleEntryFormProps) {
  const t = useT();
  const descriptionId = id ? `${id}-description` : "schedule-description";

  return (
    <>
      {id && <input type="hidden" name={SCHEDULE_FORM_FIELD.ID} value={id} />}

      <ScheduleDatePicker range={range} onRangeChange={onRangeChange} />

      <ScheduleTypePicker value={entryType} onChange={onEntryTypeChange} />

      <div className="space-y-1.5">
        <Label htmlFor={descriptionId}>{t.schedule.descriptionLabel}</Label>
        <Input
          id={descriptionId}
          name={SCHEDULE_FORM_FIELD.DESCRIPTION}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={200}
          placeholder={t.schedule.descriptionPlaceholder}
        />
      </div>
    </>
  );
}
