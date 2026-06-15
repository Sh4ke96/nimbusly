"use client";

import { useActionState } from "react";
import { CircleCheck } from "lucide-react";
import { type VariantProps } from "class-variance-authority";
import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { CHORE_STATUS } from "@/lib/constants/chores";
import { Button, buttonVariants } from "@/components/ui/button";
import { completeChoreOccurrence } from "@/app/(app)/chores/actions";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
import { useT } from "@/lib/lang-context";

interface ChoreOccurrenceCompleteButtonProps {
  taskId: string;
  occurrenceDate: string;
  disabled?: boolean;
  size?: "sm" | "default";
  variant?: VariantProps<typeof buttonVariants>["variant"];
  className?: string;
  onSuccess?: () => void;
}

export function ChoreOccurrenceCompleteButton({
  taskId,
  occurrenceDate,
  disabled,
  size = "sm",
  variant = "outline",
  className,
  onSuccess,
}: ChoreOccurrenceCompleteButtonProps) {
  const t = useT();
  const celebrate = useNimbusCelebration();
  const [state, action, pending] = useActionState(completeChoreOccurrence, null);

  useActionFeedback(state, () => {
    celebrate("firstChore");
    onSuccess?.();
  }, pending);

  return (
    <form action={action} className={className}>
      <input type="hidden" name={CHORE_FORM_FIELD.ID} value={taskId} />
      <input type="hidden" name={CHORE_FORM_FIELD.OCCURRENCE_DATE} value={occurrenceDate} />
      <Button
        type="submit"
        size={size}
        variant={variant}
        disabled={disabled || pending}
        className="cursor-pointer rounded-none h-8 text-xs gap-1.5 px-2.5"
      >
        <CircleCheck className="size-3.5" />
        {t.chores.statusLabels[CHORE_STATUS.COMPLETED]}
      </Button>
    </form>
  );
}
