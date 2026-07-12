"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BirthdayEntryForm } from "@/components/birthdays/birthday-entry-form";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateBirthday } from "@/app/(app)/birthdays/actions";
import type { BirthdayEntry } from "@/lib/birthdays/types";
import { toast } from "sonner";

interface BirthdayEditDialogProps {
  entry: BirthdayEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function BirthdayEditForm({
  entry,
  onSuccess,
  onClose,
}: {
  entry: BirthdayEntry;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const [personName, setPersonName] = useState<string>(() => entry.person_name);
  const [includeYear, setIncludeYear] = useState<boolean>(() => entry.birth_year !== null);
  const [date, setDate] = useState<Date | undefined>(() =>
    entry.birth_year
      ? new Date(entry.birth_year, entry.birth_month - 1, entry.birth_day)
      : new Date(2000, entry.birth_month - 1, entry.birth_day)
  );
  const [description, setDescription] = useState<string>(() => entry.description);
  const [state, action, pending] = useActionState(updateBirthday, null);

  useActionFeedback(state, () => {
    onClose();
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!date) {
      e.preventDefault();
      toast.error(t.birthdays.errorDateRequired);
    }
  }

  return (
    <form action={action} className="space-y-4" onSubmit={onSubmit}>
      <BirthdayEntryForm
        id={entry.id}
        personName={personName}
        onPersonNameChange={setPersonName}
        date={date}
        onDateChange={setDate}
        includeYear={includeYear}
        onIncludeYearChange={setIncludeYear}
        description={description}
        onDescriptionChange={setDescription}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.birthdays.saving : t.birthdays.saveBtn}
      </Button>
    </form>
  );
}

export function BirthdayEditDialog({
  entry,
  open,
  onOpenChange,
  onSuccess,
}: BirthdayEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.birthdays.editTitle}</DialogTitle>
        </DialogHeader>
        {entry && (
          <BirthdayEditForm
            key={entry.id}
            entry={entry}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
