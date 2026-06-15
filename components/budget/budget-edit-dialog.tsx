"use client";

import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { useActionState, useState } from "react";
import { updateBudget } from "@/app/(app)/budget/actions";
import { BudgetMemberPicker } from "@/components/budget/budget-member-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { BUDGET_NAME_MAX_LENGTH } from "@/lib/constants/budget";
import type { Budget } from "@/lib/budget/types";
import { useProfileStore } from "@/lib/stores/profile-store";

interface BudgetEditDialogProps {
  budget: Budget | null;
  memberIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function BudgetEditForm({
  budget,
  memberIds,
  onSuccess,
  onClose,
}: {
  budget: Budget;
  memberIds: string[];
  onSuccess?: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const [name, setName] = useState<string>(() => budget.name);
  const [isHidden, setIsHidden] = useState<boolean>(() => budget.is_hidden);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(() => memberIds);
  const [state, action, pending] = useActionState(updateBudget, null);

  useActionFeedback(state, () => {
    onClose();
    onSuccess?.();
  });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name={BUDGET_FORM_FIELD.ID} value={budget.id} />
      <div className="space-y-2">
        <Label htmlFor="budget-edit-name">{t.budget.nameLabel}</Label>
        <Input
          id="budget-edit-name"
          name={BUDGET_FORM_FIELD.NAME}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={BUDGET_NAME_MAX_LENGTH}
          className="rounded-none"
        />
      </div>
      <BudgetMemberPicker
        profile={profile}
        members={members}
        selectedIds={selectedMemberIds}
        onChange={setSelectedMemberIds}
      />
      <div className="flex items-start gap-3 rounded-none border border-border bg-muted/30 px-3 py-3">
        <input
          type="hidden"
          name={BUDGET_FORM_FIELD.IS_HIDDEN}
          value={isHidden ? "true" : "false"}
        />
        <Checkbox
          id="budget-edit-hidden"
          checked={isHidden}
          onCheckedChange={(checked) => setIsHidden(checked === true)}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label htmlFor="budget-edit-hidden" className="cursor-pointer font-medium">
            {t.budget.hiddenLabel}
          </Label>
          <p className="text-xs text-muted-foreground">{t.budget.hiddenHint}</p>
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-full cursor-pointer">
        {pending ? t.budget.saving : t.budget.saveBtn}
      </Button>
    </form>
  );
}

export function BudgetEditDialog({
  budget,
  memberIds,
  open,
  onOpenChange,
  onSuccess,
}: BudgetEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.budget.editTitle}</DialogTitle>
        </DialogHeader>
        {budget && (
          <BudgetEditForm
            key={`${budget.id}:${budget.is_hidden}:${memberIds.join(",")}`}
            budget={budget}
            memberIds={memberIds}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
