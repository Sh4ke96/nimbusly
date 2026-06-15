"use client";

import { useActionState, useEffect, useState } from "react";
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialDate?: Date;
  onTriggerClick?: () => void;
}

export function BirthdayFormDialog({
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  initialDate,
  onTriggerClick,
}: BirthdayFormDialogProps) {
  const t = useT();
  const celebrate = useNimbusCelebration();
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isControlled = onOpenChange !== undefined;
  const open = isControlled ? (controlledOpen ?? false) : internalOpen;
  const [personName, setPersonName] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>();
  const [description, setDescription] = useState<string>("");
  const [state, action, pending] = useActionState(createBirthday, null);

  function handleOpenChange(next: boolean) {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
    if (!next) {
      setPersonName("");
      setDate(undefined);
      setDescription("");
    }
  }

  useEffect(() => {
    if (!open || !initialDate) return;
    setDate(initialDate);
  }, [open, initialDate]);

  useActionFeedback(state, () => {
    celebrate("firstBirthday");
    handleOpenChange(false);
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!date) {
      e.preventDefault();
      toast.error(t.birthdays.errorDateRequired);
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
