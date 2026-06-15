"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BirthdayEntryForm } from "@/components/birthdays/birthday-entry-form";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
import { createBirthday } from "@/app/(app)/birthdays/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface BirthdayFormDialogProps {
  onSuccess: () => void;
}

export function BirthdayFormDialog({ onSuccess }: BirthdayFormDialogProps) {
  const t = useT();
  const celebrate = useNimbusCelebration();
  const [open, setOpen] = useState<boolean>(false);
  const [personName, setPersonName] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [description, setDescription] = useState<string>("");
  const [state, action, pending] = useActionState(createBirthday, null);

  useActionFeedback(state, () => {
    celebrate("firstBirthday");
    setOpen(false);
    setPersonName("");
    setDate(undefined);
    setDescription("");
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!date) {
      e.preventDefault();
      toast.error(t.birthdays.errorDateRequired);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t.birthdays.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.birthdays.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <BirthdayEntryForm
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
      </DialogContent>
    </Dialog>
  );
}
