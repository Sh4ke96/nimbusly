"use client";

import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CHORE_CUSTOM_INTERVAL_MAX,
  CHORE_CUSTOM_INTERVAL_MIN,
  CHORE_RECURRENCE,
} from "@/lib/constants/chores";
import type { ChoreRecurrenceDuration } from "@/lib/constants/chores";
import { useT } from "@/lib/lang-context";

interface ChoreCustomRecurrenceFieldsProps {
  intervalDays: number | null;
  onIntervalDaysChange: (value: number | null) => void;
}

export function ChoreCustomRecurrenceFields({
  intervalDays,
  onIntervalDaysChange,
}: ChoreCustomRecurrenceFieldsProps) {
  const t = useT();

  return (
    <div className="space-y-1.5">
      <input
        type="hidden"
        name={CHORE_FORM_FIELD.RECURRENCE_INTERVAL_DAYS}
        value={intervalDays ?? ""}
      />
      <Label htmlFor="chore-recurrence-interval">{t.chores.recurrenceIntervalLabel}</Label>
      <p className="text-xs text-muted-foreground">{t.chores.recurrenceIntervalHint}</p>
      <Input
        id="chore-recurrence-interval"
        type="number"
        min={CHORE_CUSTOM_INTERVAL_MIN}
        max={CHORE_CUSTOM_INTERVAL_MAX}
        value={intervalDays ?? ""}
        onChange={(e) => {
          const raw = e.target.value.trim();
          if (!raw) {
            onIntervalDaysChange(null);
            return;
          }
          const parsed = Number(raw);
          onIntervalDaysChange(Number.isFinite(parsed) ? parsed : null);
        }}
        placeholder={t.chores.recurrenceIntervalPlaceholder}
        className="rounded-none"
        required
      />
    </div>
  );
}

export function isValidChoreCustomRecurrenceForm(
  recurrence: string | null,
  intervalDays: number | null,
  duration: ChoreRecurrenceDuration | null
): boolean {
  if (!recurrence || recurrence === CHORE_RECURRENCE.NONE) return true;
  if (!duration) return false;
  if (recurrence !== CHORE_RECURRENCE.CUSTOM) return true;
  if (!intervalDays) return false;
  return (
    intervalDays >= CHORE_CUSTOM_INTERVAL_MIN &&
    intervalDays <= CHORE_CUSTOM_INTERVAL_MAX
  );
}
