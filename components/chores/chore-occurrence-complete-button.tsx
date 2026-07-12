"use client";

import { useActionState, useEffect } from "react";
import { CircleCheck } from "lucide-react";
import { type VariantProps } from "class-variance-authority";
import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { CHORE_STATUS } from "@/lib/constants/chores";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { completeChoreOccurrence } from "@/app/(app)/chores/actions";
import {
  clearPendingChoreTask,
  setPendingChoreTask,
} from "@/lib/chores/pending-chore-tasks";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
import { useT } from "@/lib/lang-context";

interface ChoreOccurrenceCompleteButtonProps {
  taskId: string;
  occurrenceDate: string;
  disabled?: boolean;
  size?: "sm" | "default";
  variant?: VariantProps<typeof buttonVariants>["variant"];
  appearance?: "button" | "inline";
  className?: string;
  buttonClassName?: string;
  onSuccess?: () => void;
}

export function ChoreOccurrenceCompleteButton({
  taskId,
  occurrenceDate,
  disabled,
  size = "sm",
  variant = "outline",
  appearance = "button",
  className,
  buttonClassName,
  onSuccess,
}: ChoreOccurrenceCompleteButtonProps) {
  const t = useT();
  const celebrate = useNimbusCelebration();
  const [state, action, pending] = useActionState(completeChoreOccurrence, null);

  useActionFeedback(state, () => {
    clearPendingChoreTask(taskId);
    celebrate("firstChore");
    onSuccess?.();
  }, pending);

  useEffect(() => {
    if (state && "error" in state) {
      clearPendingChoreTask(taskId);
    }
  }, [state, taskId]);

  return (
    <form
      action={action}
      className={className}
      onSubmit={() => setPendingChoreTask(taskId)}
    >
      <input type="hidden" name={CHORE_FORM_FIELD.ID} value={taskId} />
      <input type="hidden" name={CHORE_FORM_FIELD.OCCURRENCE_DATE} value={occurrenceDate} />
      {appearance === "inline" ? (
        <button
          type="submit"
          disabled={disabled || pending}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-inherit underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CircleCheck className="size-3.5 shrink-0" aria-hidden />
          {t.chores.statusLabels[CHORE_STATUS.COMPLETED]}
        </button>
      ) : (
        <Button
          type="submit"
          size={size}
          variant={variant}
          disabled={disabled || pending}
          className={cn(
            "cursor-pointer rounded-none h-8 text-xs gap-1.5 px-2.5",
            buttonClassName
          )}
        >
          <CircleCheck className="size-3.5" />
          {t.chores.statusLabels[CHORE_STATUS.COMPLETED]}
        </Button>
      )}
    </form>
  );
}
