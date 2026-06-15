"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Label } from "@/components/ui/label";
import {
  BUDGET_RECURRENCE,
  BUDGET_RECURRENCES,
  type BudgetRecurrence,
} from "@/lib/constants/budget";
import { dateToExpenseDateString } from "@/lib/budget/types";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import { useT } from "@/lib/lang-context";

interface BudgetRecurrenceFieldsProps {
  recurrence: BudgetRecurrence;
  onRecurrenceChange: (value: BudgetRecurrence) => void;
  recurrenceEndDate: Date | undefined;
  onRecurrenceEndDateChange: (date: Date | undefined) => void;
}

export function BudgetRecurrenceFields({
  recurrence,
  onRecurrenceChange,
  recurrenceEndDate,
  onRecurrenceEndDateChange,
}: BudgetRecurrenceFieldsProps) {
  const t = useT();
  const isRecurring = recurrence !== BUDGET_RECURRENCE.NONE;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t.budget.recurrenceLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.budget.recurrenceHint}</p>
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_RECURRENCES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onRecurrenceChange(value)}
              className={selectionPickerTileButtonClasses(recurrence === value, "px-3 py-2 text-sm")}
            >
              {t.budget.recurrenceLabels[value]}
            </button>
          ))}
        </div>
        <input type="hidden" name={BUDGET_FORM_FIELD.RECURRENCE} value={recurrence} />
      </div>

      {isRecurring && (
        <DatePickerField
          label={t.budget.recurrenceEndDateLabel}
          hint={t.budget.recurrenceEndDateHint}
          placeholder={t.budget.pickRecurrenceEndDate}
          date={recurrenceEndDate}
          onDateChange={onRecurrenceEndDateChange}
          hiddenInputs={
            recurrenceEndDate ? (
              <input
                type="hidden"
                name={BUDGET_FORM_FIELD.RECURRENCE_END_DATE}
                value={dateToExpenseDateString(recurrenceEndDate)}
              />
            ) : null
          }
        />
      )}
    </div>
  );
}
