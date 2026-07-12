"use client";

import { useActionState } from "react";
import { RotateCcw } from "lucide-react";
import { type VariantProps } from "class-variance-authority";
import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { uncompleteChoreOccurrence } from "@/app/(app)/chores/actions";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";

interface ChoreOccurrenceUncompleteButtonProps {
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

export function ChoreOccurrenceUncompleteButton({
  taskId,
  occurrenceDate,
  disabled,
  size = "sm",
  variant = "outline",
  appearance = "button",
  className,
  buttonClassName,
  onSuccess,
}: ChoreOccurrenceUncompleteButtonProps) {
  const t = useT();
  const [state, action, pending] = useActionState(uncompleteChoreOccurrence, null);

  useActionFeedback(state, () => {
    onSuccess?.();
  }, pending);

  return (
    <form action={action} className={className}>
      <input type="hidden" name={CHORE_FORM_FIELD.ID} value={taskId} />
      <input type="hidden" name={CHORE_FORM_FIELD.OCCURRENCE_DATE} value={occurrenceDate} />
      {appearance === "inline" ? (
        <button
          type="submit"
          disabled={disabled || pending}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-inherit underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="size-3.5 shrink-0" aria-hidden />
          {t.chores.uncompleteOccurrenceBtn}
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
          <RotateCcw className="size-3.5" />
          {t.chores.uncompleteOccurrenceBtn}
        </Button>
      )}
    </form>
  );
}
