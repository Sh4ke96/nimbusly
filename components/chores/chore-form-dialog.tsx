"use client";

import { useActionState, useState } from "react";
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
import {
  CHORE_RECURRENCE,
  CHORE_STATUS,
  type ChoreRecurrence,
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
}

export function ChoreFormDialog({ onSuccess }: ChoreFormDialogProps) {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const [open, setOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<ChoreStatus | null>(CHORE_STATUS.PENDING);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [recurrence, setRecurrence] = useState<ChoreRecurrence | null>(CHORE_RECURRENCE.NONE);
  const [state, action, pending] = useActionState(createChoreTask, null);

  function resetForm() {
    setTitle("");
    setNotes("");
    setStatus(CHORE_STATUS.PENDING);
    setAssignedTo(null);
    setDueDate(undefined);
    setRecurrence(CHORE_RECURRENCE.NONE);
  }

  useActionFeedback(
    state,
    () => {
      setOpen(false);
      resetForm();
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
    if (!isValidChoreDateString(dueDate ? dateToChoreDateString(dueDate) : null)) {
      e.preventDefault();
      toast.error(t.chores.errorInvalidDueDate);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
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
            notes={notes}
            onNotesChange={setNotes}
            status={status}
            onStatusChange={setStatus}
            assignedTo={assignedTo}
            onAssigneeChange={setAssignedTo}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            recurrence={recurrence}
            onRecurrenceChange={setRecurrence}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.chores.saving : t.chores.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
