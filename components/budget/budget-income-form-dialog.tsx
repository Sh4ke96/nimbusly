"use client";

import { useActionState, useState } from "react";
import { TrendingUp } from "lucide-react";
import { addBudgetIncome } from "@/app/(app)/budget/actions";
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
  BUDGET_EXPENSE_DESCRIPTION_MAX_LENGTH,
  BUDGET_INCOME_CATEGORIES,
  type BudgetIncomeCategory,
} from "@/lib/constants/budget";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface BudgetIncomeFormDialogProps {
  budgetId: string;
  onSuccess?: () => void;
  triggerClassName?: string;
}

export function BudgetIncomeFormDialog({
  budgetId,
  onSuccess,
  triggerClassName,
}: BudgetIncomeFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<BudgetIncomeCategory>(
    BUDGET_INCOME_CATEGORIES[0]
  );
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [state, action, pending] = useActionState(addBudgetIncome, null);

  useActionFeedback(state, () => {
    setOpen(false);
    onSuccess?.();
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setDate(new Date());
      setCategory(BUDGET_INCOME_CATEGORIES[0]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("cursor-pointer", triggerClassName)}
        >
          <TrendingUp className="size-4" />
          {t.budget.addIncomeBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.budget.addIncomeTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="budgetId" value={budgetId} />
          <input type="hidden" name="category" value={category} />

          <div className="space-y-2">
            <Label>{t.budget.incomeCategoryLabel}</Label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_INCOME_CATEGORIES.map((key) => (
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
                  {t.budget.incomeCategoryLabels[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget-income-amount">{t.budget.amountLabel}</Label>
              <Input
                id="budget-income-amount"
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
            <Label htmlFor="budget-income-description">{t.budget.descriptionLabel}</Label>
            <Textarea
              id="budget-income-description"
              name="description"
              maxLength={BUDGET_EXPENSE_DESCRIPTION_MAX_LENGTH}
              placeholder={t.budget.incomeDescriptionPlaceholder}
              className="rounded-none min-h-20"
            />
          </div>

          <Button type="submit" disabled={pending} className="w-full cursor-pointer">
            {pending ? t.budget.saving : t.budget.saveIncomeBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
