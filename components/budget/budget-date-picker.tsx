"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { useT } from "@/lib/lang-context";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { dateToExpenseDateString } from "@/lib/budget/types";

interface BudgetDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  showHint?: boolean;
}

export function BudgetDatePicker({
  date,
  onDateChange,
  showHint = true,
}: BudgetDatePickerProps) {
  const t = useT();

  return (
    <DatePickerField
      label={t.budget.dateLabel}
      hint={showHint ? t.budget.dateHint : undefined}
      placeholder={t.budget.pickDate}
      date={date}
      onDateChange={onDateChange}
      hiddenInputs={
        <input
          type="hidden"
          name={BUDGET_FORM_FIELD.EXPENSE_DATE}
          required
          value={date ? dateToExpenseDateString(date) : ""}
        />
      }
    />
  );
}
