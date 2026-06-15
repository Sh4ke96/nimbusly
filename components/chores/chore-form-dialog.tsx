"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChoreEntryForm } from "@/components/chores/chore-entry-form";
import { isValidChoreCustomRecurrenceForm } from "@/components/chores/chore-custom-recurrence-fields";
import {
  CHORE_RECURRENCE,
  CHORE_RECURRENCE_DURATION,
  CHORE_STATUS,
  type ChoreRecurrence,
  type ChoreRecurrenceDuration,
  type ChoreStatus,
} from "@/lib/constants/chores";
import {
  isValidChoreDateString,
  isValidChoreRecurrence,
  isValidChoreStatus,
  isValidChoreTitle,
  dateToChoreDateString,
} from "@/lib/chores/types";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createChoreTask } from "@/app/(app)/chores/actions";

interface ChoreFormDialogProps {
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialDueDate?: Date;
  onTriggerClick?: () => void;
}

export function ChoreFormDialog({
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  initialDueDate,
  onTriggerClick,
}: ChoreFormDialogProps) {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isControlled = onOpenChange !== undefined;
  const open = isControlled ? (controlledOpen ?? false) : internalOpen;
  const [title, setTitle] = useState<string>("");
  const [iconEmoji, setIconEmoji] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<ChoreStatus | null>(CHORE_STATUS.PENDING);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [recurrence, setRecurrence] = useState<ChoreRecurrence | null>(CHORE_RECURRENCE.NONE);
  const [recurrenceIntervalDays, setRecurrenceIntervalDays] = useState<number | null>(2);
  const [recurrenceDuration, setRecurrenceDuration] = useState<ChoreRecurrenceDuration | null>(
    CHORE_RECURRENCE_DURATION.MONTH
  );
  const [state, action, pending] = useActionState(createChoreTask, null);

  function handleOpenChange(next: boolean) {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
    if (!next) resetForm();
  }

  useEffect(() => {
    if (!open || !initialDueDate) return;
    setDueDate(initialDueDate);
  }, [open, initialDueDate]);

  function resetForm() {
    setTitle("");
    setIconEmoji(null);
    setNotes("");
    setStatus(CHORE_STATUS.PENDING);
    setAssignedTo(null);
    setDueDate(undefined);
    setRecurrence(CHORE_RECURRENCE.NONE);
    setRecurrenceIntervalDays(2);
    setRecurrenceDuration(CHORE_RECURRENCE_DURATION.MONTH);
  }

  function handleRecurrenceChange(value: ChoreRecurrence) {
    setRecurrence(value);
    if (value === CHORE_RECURRENCE.NONE) {
      setRecurrenceDuration(null);
      return;
    }
    if (recurrenceDuration === null) {
      setRecurrenceDuration(CHORE_RECURRENCE_DURATION.MONTH);
    }
    if (value === CHORE_RECURRENCE.CUSTOM && recurrenceIntervalDays === null) {
      setRecurrenceIntervalDays(2);
    }
  }

  useActionFeedback(
    state,
    () => {
      handleOpenChange(false);
      onSuccess();
    },
    pending
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isValidChoreTitle(title)) {
      e.preventDefault();
      toast.error(t.chores.errorTitleRequired);
      return;
    }
    if (!status || !isValidChoreStatus(status)) {
      e.preventDefault();
      toast.error(t.chores.errorStatusRequired);
      return;
    }
    if (!recurrence || !isValidChoreRecurrence(recurrence)) {
      e.preventDefault();
      toast.error(t.chores.errorRecurrenceRequired);
      return;
    }
    if (!isValidChoreCustomRecurrenceForm(recurrence, recurrenceIntervalDays, recurrenceDuration)) {
      e.preventDefault();
      toast.error(
        recurrence === CHORE_RECURRENCE.CUSTOM
          ? t.chores.errorCustomRecurrenceRequired
          : t.chores.errorRecurrenceDurationRequired
      );
      return;
    }
    if (
      recurrence &&
      recurrence !== CHORE_RECURRENCE.NONE &&
      !dueDate
    ) {
      e.preventDefault();
      toast.error(t.chores.errorRecurrenceStartDateRequired);
      return;
    }
    if (!isValidChoreDateString(dueDate ? dateToChoreDateString(dueDate) : null)) {
      e.preventDefault();
      toast.error(t.chores.errorInvalidDueDate);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          onClick={() => {
            onTriggerClick?.();
          }}
        >
          <Plus className="size-4" />
          {t.chores.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.chores.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <ChoreEntryForm
            profile={profile}
            members={members}
            title={title}
            onTitleChange={setTitle}
            iconEmoji={iconEmoji}
            onIconEmojiChange={setIconEmoji}
            notes={notes}
            onNotesChange={setNotes}
            status={status}
            onStatusChange={setStatus}
            assignedTo={assignedTo}
            onAssigneeChange={setAssignedTo}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            recurrence={recurrence}
            onRecurrenceChange={handleRecurrenceChange}
            recurrenceIntervalDays={recurrenceIntervalDays}
            onRecurrenceIntervalDaysChange={setRecurrenceIntervalDays}
            recurrenceDuration={recurrenceDuration}
            onRecurrenceDurationChange={setRecurrenceDuration}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.chores.saving : t.chores.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
