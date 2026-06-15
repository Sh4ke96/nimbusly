"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/lang-context";

interface BudgetPaymentReminderFieldProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function BudgetPaymentReminderField({
  enabled,
  onEnabledChange,
}: BudgetPaymentReminderFieldProps) {
  const t = useT();

  return (
    <div className="flex items-start gap-3 rounded-none border border-border bg-muted/30 px-3 py-3">
      <input
        type="hidden"
        name={BUDGET_FORM_FIELD.PAYMENT_REMINDER_ENABLED}
        value={enabled ? "true" : "false"}
      />
      <Checkbox
        id="budget-payment-reminder"
        checked={enabled}
        onCheckedChange={(checked) => onEnabledChange(checked === true)}
        className="mt-0.5"
      />
      <div className="space-y-1">
        <Label htmlFor="budget-payment-reminder" className="cursor-pointer font-medium">
          {t.budget.paymentReminderLabel}
        </Label>
        <p className="text-xs text-muted-foreground">{t.budget.paymentReminderHint}</p>
      </div>
    </div>
  );
}
