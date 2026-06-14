"use client";

import { useActionState, useEffect, useState } from "react";
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

export function BirthdayEditDialog({
  entry,
  open,
  onOpenChange,
  onSuccess,
}: BirthdayEditDialogProps) {
  const t = useT();
  const [personName, setPersonName] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [description, setDescription] = useState("");
  const [state, action, pending] = useActionState(updateBirthday, null);

  useEffect(() => {
    if (!entry || !open) return;
    setPersonName(entry.person_name);
    setDate(new Date(2000, entry.birth_month - 1, entry.birth_day));
    setDescription(entry.description);
  }, [entry, open]);

  useActionFeedback(state, () => {
    onOpenChange(false);
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!date) {
      e.preventDefault();
      toast.error(t.birthdays.errorDateRequired);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.birthdays.editTitle}</DialogTitle>
        </DialogHeader>
        {entry && (
          <form action={action} className="space-y-4" onSubmit={onSubmit}>
            <BirthdayEntryForm
              id={entry.id}
              personName={personName}
              onPersonNameChange={setPersonName}
              date={date}
              onDateChange={setDate}
              description={description}
              onDescriptionChange={setDescription}
            />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t.birthdays.saving : t.birthdays.saveBtn}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
