"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createBudget } from "@/app/(app)/budget/actions";
import { BudgetMemberPicker } from "@/components/budget/budget-member-picker";
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
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
import { useT } from "@/lib/lang-context";
import { BUDGET_NAME_MAX_LENGTH } from "@/lib/constants/budget";
import { useProfileStore } from "@/lib/stores/profile-store";

interface BudgetFormDialogProps {
  onSuccess?: () => void;
}

export function BudgetFormDialog({ onSuccess }: BudgetFormDialogProps) {
  const t = useT();
  const celebrate = useNimbusCelebration();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [state, action, pending] = useActionState(createBudget, null);

  useActionFeedback(state, () => {
    celebrate("firstBudget");
    setOpen(false);
    setSelectedMemberIds([]);
    onSuccess?.();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="cursor-pointer">
          <Plus className="size-4" />
          {t.budget.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.budget.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget-name">{t.budget.nameLabel}</Label>
            <Input
              id="budget-name"
              name={BUDGET_FORM_FIELD.NAME}
              required
              maxLength={BUDGET_NAME_MAX_LENGTH}
              placeholder={t.budget.namePlaceholder}
              className="rounded-none"
            />
            <p className="text-xs text-muted-foreground">{t.budget.nameHint}</p>
          </div>
          <BudgetMemberPicker
            profile={profile}
            members={members}
            selectedIds={selectedMemberIds}
            onChange={setSelectedMemberIds}
          />
          <Button type="submit" disabled={pending} className="w-full cursor-pointer">
            {pending ? t.budget.saving : t.budget.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
