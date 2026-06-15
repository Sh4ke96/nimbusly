"use client";

import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { Label } from "@/components/ui/label";
import {
  CHORE_RECURRENCE_DURATIONS,
  type ChoreRecurrenceDuration,
} from "@/lib/constants/chores";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import { useT } from "@/lib/lang-context";

interface ChoreRecurrenceDurationFieldsProps {
  duration: ChoreRecurrenceDuration | null;
  onDurationChange: (value: ChoreRecurrenceDuration) => void;
}

export function ChoreRecurrenceDurationFields({
  duration,
  onDurationChange,
}: ChoreRecurrenceDurationFieldsProps) {
  const t = useT();

  return (
    <div className="space-y-1.5">
      <input
        type="hidden"
        name={CHORE_FORM_FIELD.RECURRENCE_DURATION}
        value={duration ?? ""}
      />
      <Label>{t.chores.recurrenceDurationLabel}</Label>
      <p className="text-xs text-muted-foreground">{t.chores.recurrenceDurationHint}</p>
      <div className="grid grid-cols-2 gap-2">
        {CHORE_RECURRENCE_DURATIONS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onDurationChange(value)}
            className={selectionPickerTileButtonClasses(duration === value, "px-2 py-2 text-xs")}
          >
            {t.chores.recurrenceDurationLabels[value]}
          </button>
        ))}
      </div>
    </div>
  );
}
