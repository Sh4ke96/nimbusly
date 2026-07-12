"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { updateBudgetExpense } from "@/app/(app)/budget/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BudgetDatePicker } from "@/components/budget/budget-date-picker";
import { BudgetPaymentReminderField } from "@/components/budget/budget-payment-reminder-field";
import { BudgetRecurrenceFields } from "@/components/budget/budget-recurrence-fields";
import {
  BUDGET_EXPENSE_CATEGORIES,
  BUDGET_EXPENSE_DESCRIPTION_MAX_LENGTH,
  type BudgetExpenseCategory,
  type BudgetRecurrence,
} from "@/lib/constants/budget";
import type { BudgetExpense } from "@/lib/budget/types";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import { useT } from "@/lib/lang-context";

function parseExpenseDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

interface BudgetExpenseEditDialogProps {
  entry: BudgetExpense;
  budgetId: string;
  onSuccess?: () => void;
}

function BudgetExpenseEditForm({
  entry,
  budgetId,
  onSuccess,
  onClose,
}: BudgetExpenseEditDialogProps & { onClose: () => void }) {
  const t = useT();
  const [category, setCategory] = useState<BudgetExpenseCategory>(
    () => entry.category as BudgetExpenseCategory
  );
  const [date, setDate] = useState<Date | undefined>(() => parseExpenseDate(entry.expense_date));
  const [recurrence, setRecurrence] = useState<BudgetRecurrence>(() => entry.recurrence);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(() =>
    entry.recurrence_end_date ? parseExpenseDate(entry.recurrence_end_date) : undefined
  );
  const [paymentReminderEnabled, setPaymentReminderEnabled] = useState<boolean>(
    () => entry.payment_reminder_enabled
  );
  const [amount, setAmount] = useState<string>(() =>
    String(entry.amount).replace(".", ",")
  );
  const [description, setDescription] = useState<string>(() => entry.description);
  const [state, action, pending] = useActionState(updateBudgetExpense, null);

  useActionFeedback(state, () => {
    onClose();
    onSuccess?.();
  });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name={BUDGET_FORM_FIELD.ID} value={entry.id} />
      <input type="hidden" name={BUDGET_FORM_FIELD.BUDGET_ID} value={budgetId} />
      <input type="hidden" name={BUDGET_FORM_FIELD.CATEGORY} value={category} />
      {paymentReminderEnabled ? (
        <input type="hidden" name={BUDGET_FORM_FIELD.PAYMENT_REMINDER_ENABLED} value="true" />
      ) : null}

      <div className="space-y-2">
        <Label>{t.budget.categoryLabel}</Label>
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_EXPENSE_CATEGORIES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={selectionPickerTileButtonClasses(category === key, "px-3 py-2 text-sm")}
            >
              {t.budget.categoryLabels[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`budget-expense-edit-amount-${entry.id}`}>{t.budget.amountLabel}</Label>
          <Input
            id={`budget-expense-edit-amount-${entry.id}`}
            name={BUDGET_FORM_FIELD.AMOUNT}
            type="text"
            inputMode="decimal"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="rounded-none"
          />
        </div>
        <BudgetDatePicker date={date} onDateChange={setDate} showHint={false} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`budget-expense-edit-description-${entry.id}`}>
          {t.budget.descriptionLabel}
        </Label>
        <Textarea
          id={`budget-expense-edit-description-${entry.id}`}
          name={BUDGET_FORM_FIELD.DESCRIPTION}
          maxLength={BUDGET_EXPENSE_DESCRIPTION_MAX_LENGTH}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.budget.descriptionPlaceholder}
          className="rounded-none min-h-20"
        />
      </div>

      <BudgetRecurrenceFields
        recurrence={recurrence}
        onRecurrenceChange={setRecurrence}
        recurrenceEndDate={recurrenceEndDate}
        onRecurrenceEndDateChange={setRecurrenceEndDate}
      />

      <BudgetPaymentReminderField
        enabled={paymentReminderEnabled}
        onEnabledChange={setPaymentReminderEnabled}
      />

      <Button type="submit" disabled={pending} className="w-full cursor-pointer">
        {pending ? t.budget.saving : t.budget.saveExpenseBtn}
      </Button>
    </form>
  );
}

export function BudgetExpenseEditDialog({
  entry,
  budgetId,
  onSuccess,
}: BudgetExpenseEditDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label={t.budget.editExpenseBtn}
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.budget.editExpenseTitle}</DialogTitle>
        </DialogHeader>
        <BudgetExpenseEditForm
          key={`${entry.id}-${open}`}
          entry={entry}
          budgetId={budgetId}
          onSuccess={onSuccess}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
