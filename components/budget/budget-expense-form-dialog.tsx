"use client";

import { useActionState, useState } from "react";
import { TrendingDown } from "lucide-react";
import { addBudgetExpense } from "@/app/(app)/budget/actions";
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
import {
  BUDGET_EXPENSE_CATEGORIES,
  BUDGET_EXPENSE_DESCRIPTION_MAX_LENGTH,
  type BudgetExpenseCategory,
} from "@/lib/constants/budget";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface BudgetExpenseFormDialogProps {
  budgetId: string;
  onSuccess?: () => void;
  triggerClassName?: string;
}

export function BudgetExpenseFormDialog({
  budgetId,
  onSuccess,
  triggerClassName,
}: BudgetExpenseFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<BudgetExpenseCategory>(
    BUDGET_EXPENSE_CATEGORIES[0]
  );
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [state, action, pending] = useActionState(addBudgetExpense, null);

  useActionFeedback(state, () => {
    setOpen(false);
    onSuccess?.();
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDate(new Date());
      setCategory(BUDGET_EXPENSE_CATEGORIES[0]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="default"
          className={cn("cursor-pointer", triggerClassName)}
        >
          <TrendingDown className="size-4" />
          {t.budget.addExpenseBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.budget.addExpenseTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="budgetId" value={budgetId} />
          <input type="hidden" name="category" value={category} />

          <div className="space-y-2">
            <Label>{t.budget.categoryLabel}</Label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_EXPENSE_CATEGORIES.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={cn(
                    "cursor-pointer rounded-none border border-border px-3 py-2 text-left text-sm transition-colors",
                    category === key
                      ? "border-primary bg-primary/10"
                      : "bg-background hover:bg-muted/60"
                  )}
                >
                  {t.budget.categoryLabels[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget-expense-amount">{t.budget.amountLabel}</Label>
              <Input
                id="budget-expense-amount"
                name="amount"
                type="text"
                inputMode="decimal"
                required
                placeholder="0,00"
                className="rounded-none"
              />
            </div>
            <BudgetDatePicker date={date} onDateChange={setDate} showHint={false} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-expense-description">{t.budget.descriptionLabel}</Label>
            <Textarea
              id="budget-expense-description"
              name="description"
              maxLength={BUDGET_EXPENSE_DESCRIPTION_MAX_LENGTH}
              placeholder={t.budget.descriptionPlaceholder}
              className="rounded-none min-h-20"
            />
          </div>

          <Button type="submit" disabled={pending} className="w-full cursor-pointer">
            {pending ? t.budget.saving : t.budget.saveExpenseBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
