"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChoreEntryForm } from "@/components/chores/chore-entry-form";
import { isValidChoreCustomRecurrenceForm } from "@/components/chores/chore-custom-recurrence-fields";
import {
  CHORE_RECURRENCE,
  CHORE_RECURRENCE_DURATION,
  type ChoreRecurrence,
  type ChoreRecurrenceDuration,
} from "@/lib/constants/chores";
import type { ChoreTask } from "@/lib/chores/types";
import {
  dateToChoreDateString,
  isValidChoreDateString,
  isValidChoreRecurrence,
  isValidChoreStatus,
  isValidChoreTitle,
  parseChoreDateString,
} from "@/lib/chores/types";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateChoreTask } from "@/app/(app)/chores/actions";

interface ChoreEditDialogProps {
  task: ChoreTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ChoreEditForm({
  task,
  onSuccess,
  onClose,
}: {
  task: ChoreTask;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const [title, setTitle] = useState<string>(() => task.title);
  const [iconEmoji, setIconEmoji] = useState<string | null>(() => task.icon_emoji);
  const [notes, setNotes] = useState<string>(() => task.notes);
  const [status, setStatus] = useState<ChoreTask["status"]>(() => task.status);
  const [assignedTo, setAssignedTo] = useState<string | null>(() => task.assigned_to);
  const [dueDate, setDueDate] = useState<Date | undefined>(() =>
    parseChoreDateString(task.recurrence_start_date ?? task.due_date)
  );
  const [recurrence, setRecurrence] = useState<ChoreTask["recurrence"]>(() => task.recurrence);
  const [recurrenceIntervalDays, setRecurrenceIntervalDays] = useState<number | null>(
    () => task.recurrence_interval_days
  );
  const [recurrenceDuration, setRecurrenceDuration] = useState<ChoreRecurrenceDuration | null>(
    () =>
      task.recurrence_duration ??
      (task.recurrence !== CHORE_RECURRENCE.NONE ? CHORE_RECURRENCE_DURATION.MONTH : null)
  );
  const [state, action, pending] = useActionState(updateChoreTask, null);

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
      onClose();
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
    if (recurrence && recurrence !== CHORE_RECURRENCE.NONE && !dueDate) {
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
    <form action={action} className="space-y-4" onSubmit={onSubmit}>
      <ChoreEntryForm
        id={task.id}
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
  );
}

export function ChoreEditDialog({
  task,
  open,
  onOpenChange,
  onSuccess,
}: ChoreEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.chores.editTitle}</DialogTitle>
        </DialogHeader>
        {task && (
          <ChoreEditForm
            key={task.id}
            task={task}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
